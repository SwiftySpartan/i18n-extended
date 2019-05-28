const argv = require('yargs').argv;
const recursive = require("recursive-readdir");
const fs = require('fs-extra');
const prompts = require('prompts');
const { red, green, blue, bold } = require('kleur');
const myRxjs = require('rxjs');
const xml2js = require('xml2js');
const path = require("path");

module.exports = {
    initialTranslationsCahce: [],
    parsedDataList: [],
    i18nSourceFiles: [],
    getFiles: () => {
        return new Promise((resolve, reject) => {
            if (argv.angularProjectPath) {
                recursive(argv.angularProjectPath, ["*.html","*.scss", "index.ts","*.module.ts","*.spec.ts", "*.js", "*.go", "*.json", "*.md", "*.directive.ts"], function (err, files) {
                    resolve(files);
                });
            } else {
                reject(bold().red('Please include the --angularProjectPath flag'));
            }
        })
    },
    readFiles: (pathList) => {
        return new myRxjs.Observable(observe => {
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
            if (argv.angularProjectPath) {
                recursive(argv.angularProjectPath,
                    ["*.html","*.scss","*.ts","*.js", "*.go", "*.cpp", "*.json", "*.md"],
                    (err, files) => {
                        const filteredFiles = files.filter(item => item.includes('xlf'));
                        observe.next(filteredFiles);
                        if (filteredFiles.length < 1) {
                            observe.error(new Error('Cannot find any i18n .xlf translation files!'));
                        }
                        observe.complete()
                    });
            } else {
                observe.error(new Error('Cannot find any i18n .xlf translation files!'))
            }
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
                let translationInterface = 'module.exports = {  \n  getTranslationStrings: () => { \n      return [';
                let importLines = '';
                observe.next('Indexing translation file paths');
                for (let path of pathList) {
                    const name = path.replace(/[/]/g,'').replace(/[.]/g,'').replace(/[-]/g,'');
                    const line = module.exports.generateImportString(`${name}`,path);
                    translationInterface += `${name}` + ', '
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
    generateImportString: (variableName, path) => {
        return `const ${variableName} = require('raw-loader!./${path}');`
    },
    getPackageLocation: () => {
        return __dirname.replace('/src/cli','');
    }
};
