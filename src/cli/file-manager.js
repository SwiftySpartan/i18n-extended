const argv = require('yargs').argv;
const recursive = require("recursive-readdir");
const fs = require('fs-extra');
const prompts = require('prompts');
const { red, green, blue, bold } = require('kleur');
const rxjs = require('rxjs');
const xml2js = require('xml2js');

module.exports = {
    initialTranslationsCahce: [],
    parsedDataList: [],
    i18nSourceFiles: [],
    getFiles: () => {
        return new Promise((resolve, reject) => {
            if (argv.angularProjectPath) {
                recursive(argv.angularProjectPath, ["*.html","*.scss", "index.ts","*.module.ts","*.spec.ts", "*.js", "*.go", "*.json", "*.md"], function (err, files) {
                    resolve(files);
                });
            } else {
                reject(bold().red('Please include the --angularProjectPath flag'));
            }
        })
    },
    readFiles: (pathList) => {
        return new rxjs.Observable(observe => {
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
        return fileString.match(/(.setTranslateText[(]['])\w+(['][)])/g);
    },
    parseExtractionList: (extractionList) => {
        return extractionList.map(item => {
            const parsedObject = {};
            const text = item[0].split(`'`)[1];
            if (text) {
                parsedObject['text'] = text.split(`,`)[0];
                parsedObject['description'] = text.split(`,`)[1];
            }
            if (parsedObject && parsedObject.text) {
                return parsedObject;
            }
        });
    },
    geti18nExtractionFiles: () => {
        return new rxjs.Observable(observer => {
            if (argv.angularProjectPath) {
                    recursive(argv.angularProjectPath,
                    ["*.html","*.scss","*.ts","*.js", "*.go", "*.cpp", "*.json", "*.md"],
                    (err, files) => {
                    const filteredFiles = files.filter(item => item.includes('xlf'));
                    observer.next(filteredFiles);
                    observer.complete()
                });
            } else {
                observer.error(bold().red('Cannot find i18n extraction files'))
            }
        })
    },
    appendi18nExtractionFiles: (extractionList, parsedDataList, observer) => {
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
                    let counter = 0;
                    for (let item of parsedDataList) {
                        if (item.text && value.content.includes(`<source>${item.text}</source>`)) {
                            counter++;
                            if (counter === parsedDataList.length - 1) {
                                setTimeout(() => {
                                    observer.complete();
                                }, 1000);
                            }
                            continue;
                        }
                        observer.next(`Adding new phrase: '${item.text}' to translation files`);
                        const temp = module.exports.generateXLFTemplate(item.text, item.description ? item.description : '');
                        if (temp) {
                            filteredList[0].body[0]['trans-unit'].push(temp)
                        }
                        // apply new entries to js version of xml file
                        result.xliff.file = filteredList;
                        // generate new xml builder
                        const builder = new xml2js.Builder();
                        // generate xml string for file generation
                        const xml = builder.buildObject(result);
                        // write new file with new content
                        fs.writeFile(value.name, xml);
                        observe.next(`Finished writing to ${value.name}`);
                        counter++;
                        if (counter === parsedDataList.length - 1) {
                            setTimeout(() => {
                                observer.complete();
                            }, 1000);
                        }
                    }
                }
            });
        })
    },
    generateXLFTemplate: (text , note) => {
        let notesTemplateList = [];
        const noteTemplate = module.exports.generateXLFNote(note);
        if (noteTemplate) {
            notesTemplateList.push(noteTemplate);
        }
        return {
        $: {
            id: 'test',
            datatype: 'html',
        },
        source: [`${text}`],
        note: notesTemplateList,
        }
    },
    generateXLFNote: (message) => {
        return { _: `${message}`, '$': { priority: '1', from: `description` }}
    }
};