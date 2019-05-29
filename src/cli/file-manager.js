const argv = require('yargs').argv;
const recursive = require("recursive-readdir");
const fs = require('fs-extra');
const prompts = require('prompts');
const { red, green, blue, bold } = require('kleur');
const myRxjs = require('rxjs');
const xml2js = require('xml2js');
const path = require("path");
const process = require('process');
const execa = require('execa');
const cp = require("child_process");

module.exports = {
    angularProjects: [],
    defaultProject: 0,
    initialTranslationsCahce: [],
    parsedDataList: [],
    i18nSourceFiles: [],
    getFiles: () => {
        return new Promise((resolve, reject) => {
            if (module.exports.getAngularLocation()) {
                recursive(module.exports.getAngularLocation(), ["*.html","*.scss", "index.ts","*.module.ts","*.spec.ts", "*.js", "*.go", "*.json", "*.md", "*.directive.ts"], function (err, files) {
                    resolve(files);
                });
            } else {
                reject(bold().red('Cannot find your Angular project/application'));
            }
        })
    },
    readFiles: (pathList) => {
        return new myRxjs.Observable(observe => {
            if (!pathList) {
                observe.error(new Error('No files found'));
            }
            if (pathList) {
                for (let i = 0; i < pathList.length; i++) {
                    const path = pathList[i];
                    try {
                        fs.readFile(path, 'utf8', (err, contents) => {
                            observe.next({
                                name: path,
                                content: contents,
                            });
                            if (i === pathList.length - 1) {
                                observe.complete();
                            }
                        });
                    } catch (e) {
                        observe.error(e);
                    }
                }
            }
        });
    },
    getTsTranslationsFromFile: (fileString) => {
        if (!fileString) {
            return null;
        }
        return fileString.match(/.translateText\(([^)]+)\)/g);
    },
    parseExtractionList: (extractionList) => {
        return extractionList.map(item => {
            const parsedObject = {};
            if (item) {
                parsedObject['text'] = item.split(`,`)[0];
                parsedObject['description'] = item.split(`,`)[1];
            }
            let text = parsedObject.text.split(`'`)[1];
            if (!text) {
                text = parsedObject.text.split('`')[1];
            }
            if (!text) {
                text = parsedObject.text.split('"')[1];
            }
            parsedObject.text = text;

            if (parsedObject.description) {
                let description = parsedObject.description.split(`'`)[1];
                if (!description) {
                    description = parsedObject.description.split('`')[1];
                }
                if (!description) {
                    description = parsedObject.description.split('"')[1];
                }
                parsedObject.description = description;
            }
            if (parsedObject && parsedObject.text) {
                return parsedObject;
            }
        });
    },
    geti18nExtractionFiles: () => {
        return new myRxjs.Observable(observe => {
            recursive(module.exports.getAngularLocation(),
                ["*.html","*.scss","*.ts","*.js", "*.go", "*.cpp", "*.json", "*.md"],
                (err, files) => {
                    const filteredFiles = files.filter(item => item.includes('xlf'));
                    observe.next(filteredFiles);
                    if (filteredFiles.length < 1) {
                        observe.error(new Error('Cannot find any i18n .xlf translation files!'));
                    }
                    observe.complete()
                });
        })
    },
    appendi18nExtractionFiles: (extractionList, parsedDataList, observe) => {
        if (extractionList.length < 1) {
            observe.error(new Error('Cannot find any strings!'));
        }
        module.exports.readFiles(extractionList).subscribe(value => {
            xml2js.parseString(value.content, (err, result) => {
                // filter for the source file/ / source language
                const filteredList = [];
                result.xliff.file.forEach(item => {
                    if (item.$['source-language'] === item.$['target-language'] || item.$['target-language'] === undefined) {
                        filteredList.push(item);
                    }
                });
                if (filteredList.length > 0) {
                    // build new entries
                    for (let item of parsedDataList) {
                        if (!item) {
                            continue;
                        }
                        if (item.text && value.content.includes(`<source>${item.text}</source>`)) {
                            continue;
                        }
                        observe.next(`Adding new phrase: '${item.text}' to translation files`);
                        const temp = module.exports.generateXLFTemplate(item.text, item.description ? item.description : null);
                        if (temp) {
                            filteredList[0].body[0]['trans-unit'].push(temp)
                        }
                        result.xliff.file = filteredList;
                        // generate new xml builder
                        const builder = new xml2js.Builder();
                        // generate xml string for file generation
                        const xml = builder.buildObject(result);
                        // write new file with new content
                        fs.writeFile(value.name, xml);
                        observe.next(`Finished writing to ${value.name}`);
                    }
                }
                observe.complete();
            });
        })
    },
    generateXLFTemplate: (text , note) => {
        let notesTemplateList = [];
        const noteTemplate = module.exports.generateXLFNote(note);
        if (noteTemplate) {
            notesTemplateList.push(noteTemplate);
        }
        if (notesTemplateList.length > 0) {
            return {
                $: {
                    datatype: 'html',
                },
                source: [`${text}`],
                note: notesTemplateList,
            }
        } else {
            return {
                $: {
                    datatype: 'html',
                },
                source: [`${text}`],
            }
        }
    },
    generateXLFNote: (message) => {
        if (!message) {
            return null;
        }
        return { _: `${message}`, '$': { priority: '1', from: `description` }}
    },
    generateIndexFile: (observe) => {
        module.exports.geti18nExtractionFiles().subscribe({
            next: (pathList) => {
                const generateMessage = '// This file has been automatically generated by the i18n-extended cli \n// Do not modify or remove anything from this file \n \n';
                let translationInterface = 'module.exports = {  \n  getTranslationStrings: () => { \n      return [\n      ';
                let importLines = '';
                observe.next('Indexing translation file paths');
                for (let path of pathList) {
                    const name = path.replace(/[/]/g,'').replace(/[.]/g,'').replace(/[-]/g,'');
                    const line = module.exports.generateImportString(`${name}`, path);
                    translationInterface += `${name}` + ',\n      '
                    importLines += line + '\n';
                }
                translationInterface = translationInterface.substr(0, translationInterface.length - 2);
                if (translationInterface) {
                    translationInterface += '];\n    }\n};';
                }
                const fileData = generateMessage + importLines + '\n' + translationInterface;
                observe.next('Writing translations to disc');
                const modulePath = module.exports.getPackageLocation();
                fs.writeFile(`${module.exports.getPackageLocation()}/src/services/i18n-extended-translation-data.js`, fileData);
            },
            complete: () => {
                observe.complete();
            },
        })
    },
    generateImportString: (variableName, pathFromNodeModules) => {
        return `const ${variableName} = require('raw-loader!${pathFromNodeModules}');`
    },
    getPackageLocation: () => {
        return __dirname.replace('/src/cli','');
    },
    getAngularLocation: () => {
        return module.exports.angularProjects[module.exports.defaultProject];
    },
    setAngularDirectory: (path) => {
        return new myRxjs.Observable(observe => {
            recursive(path, ["*.html","*.scss", "index.ts","*.module.ts","*.spec.ts", "*.js", "*.ts", "*.md", "*.directive.ts"], (err, files) => {
                // filter for angular.json file
                if (err) {
                    observe.error(err);
                }
                if (!files) {
                    observe.complete();
                    return;
                }
                let filteredFilesList = files.filter(fileName => {
                    if (fileName.includes('angular.json') && !fileName.includes('node_modules/@schematics')) {
                        return fileName;
                    }
                });
                filteredFilesList = filteredFilesList.map(filePath => {
                    return filePath.split('angular.json')[0]
                });
                module.exports.angularProjects = filteredFilesList;
                observe.complete()
            });
        })
    },
    installService: (path) => {
        return new myRxjs.Observable(observe => {
            (async () => {
                cp.exec("npm install @andrewwormald/i18n-extended@latest --save", {cwd: path}, (error,stdout,stderr) => {
                    if (error) {
                        observe.error();
                    }
                    if (stdout) {
                        observe.complete();
                    }
                });
            })();
        });
    }
};
