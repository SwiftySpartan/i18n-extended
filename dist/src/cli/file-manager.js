const recursive = require("recursive-readdir");
const fs = require('fs-extra');
const prompts = require('prompts');
const {red, green, blue, bold} = require('kleur');
const myRxjs = require('rxjs');
const xml2js = require('xml2js');
const path = require("path");
const process = require('process');
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
                recursive(module.exports.getAngularLocation(), ["*.html", "*.scss", "index.ts", "*.module.ts", "*.spec.ts", "*.js", "*.go", "*.json", "*.md", "*.directive.ts"], function (err, files) {
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
                ["*.html", "*.scss", "*.ts", "*.js", "*.go", "*.cpp", "*.json", "*.md"],
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
        // remove nulls
        parsedDataList = parsedDataList.filter(v => v);
        let cacheMap = new Set();
        parsedDataList.forEach(v => {
            cacheMap.add(v);
        });
        for (let i = 0; i < extractionList.length; i++) {
            fs.readFile(extractionList[i], 'utf8', (err, value) => {
                xml2js.parseString(value, (err, result) => {
                    // filter for the source file/ / source language
                    const filteredList = [];
                    result.xliff.file.forEach(item => {
                        if (item.$['source-language'] === item.$['target-language'] || item.$['target-language'] === undefined) {
                            filteredList.push(item);
                        }
                    });
                    if (filteredList.length > 0) {
                        // build new entries
                        for (let item of Array.from(cacheMap)) {
                            if (!item) {
                                continue;
                            }
                            if (item.text && value.includes(`<source>${item.text}</source>`)) {
                                continue;
                            }
                            observe.next(`Adding new phrase: '${item.text}' to translation files`);
                            const temp = module.exports.generateXLFTemplate(item.text, item.description ? item.description : null);
                            if (temp) {
                                filteredList[0].body[0]['trans-unit'].push(temp)
                            }
                        };
                        result.xliff.file = filteredList;
                        // generate new xml builder
                        const builder = new xml2js.Builder();
                        // generate xml string for file generation
                        const xml = builder.buildObject(result);
                        // write new file with new content
                        fs.writeFile(extractionList[i], xml);
                        observe.next(`Finished writing to ${extractionList[i]}`);
                    }
                    observe.complete();
                });
            });
        }
        observe.complete()
    },
    generateXLFTemplate: (text, note) => {
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
        return {_: `${message}`, '$': {priority: '1', from: `description`}}
    },
    generateIndexFile: (observe) => {
        module.exports.geti18nExtractionFiles().subscribe({
            next: (pathList) => {
                const generateMessage = '// This file has been automatically generated by the i18n-extended cli \n// Do not modify or remove anything from this file \n \n';
                const requireString = 'declare const require: any;'
                let translationInterface = 'export function i18nDataMap() {\n  return [\n      ';
                observe.next('Indexing translation file paths');
                for (let path of pathList) {
                    const line = module.exports.generateImportString(path);
                    translationInterface += `${line}` + ',\n      '
                }
                translationInterface = translationInterface.substr(0, translationInterface.length - 2);
                if (translationInterface) {
                    translationInterface += '];\n}';
                }
                const fileData = generateMessage + requireString + '\n' + translationInterface;

                observe.next('Writing translations to disc');
                const fileName = `${module.exports.getAngularLocation()}i18n.extended.map.ts`;
                fs.writeFile(fileName, fileData);
            },
            complete: () => {
                observe.complete();
            },
        })
    },
    generateImportString: (path) => {
        path = path.split(module.exports.getAngularLocation())[1];
        return `require('raw-loader!${path}')`
    },
    getPackageLocation: () => {
        return __dirname.replace('/src/cli', '');
    },
    getAngularLocation: () => {
        return module.exports.angularProjects[module.exports.defaultProject];
    },
    setAngularDirectory: (path) => {
        return new myRxjs.Observable(observe => {
            recursive(path, ["*.html", "*.scss", "index.ts", "*.module.ts", "*.spec.ts", "*.js", "*.ts", "*.md", "*.directive.ts"], (err, files) => {
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
                cp.exec("npm install @andrewwormald/i18n-extended@latest --save", {cwd: path}, (error, stdout, stderr) => {
                    if (error) {
                        observe.error();
                    }
                    if (stdout) {
                        observe.complete();
                    }
                });
            })();
        });
    },
    generateTranslationEntry: (message, note) => {
        if (note) {
            return `<trans-unit datatype="html">\n      <source>${message}</source>\n       <note priority="1" from="description">${note}</note>\n  </trans-unit>`
        }

        return `<trans-unit datatype="html">\n      <source>${message}</source>\n  </trans-unit>`
    }
};
