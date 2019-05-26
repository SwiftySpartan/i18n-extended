const argv = require('yargs').argv;
const recursive = require("recursive-readdir");
const fs = require('fs-extra');
const prompts = require('prompts');
const { red, green, blue, bold } = require('kleur');
const rxjs = require('rxjs');
const xml2js = require('xml2js');

module.exports = {
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
            for (let path of pathList) {
                try {
                    fs.readFile(path, 'utf8', (err, contents) => {
                        observe.next({
                            name: path,
                            content: contents,
                        });
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
        return extractionList.map(item => item.split(`'`)[1]);
    },
    geti18nExtractionFiles: () => {
        return new rxjs.Observable(observer => {
            if (argv.angularProjectPath) {
                    recursive(argv.angularProjectPath,
                    ["*.html","*.scss","*.ts","*.js", "*.go", "*.cpp", "*.json", "*.md"],
                    (err, files) => {
                    const filteredFiles = files.filter(item => item.includes('xlf'));
                    observer.next(filteredFiles);
                });
            } else {
                observer.error(bold().red('Cannot find i18n extraction files'))
            }
        })
    },
    appendi18nExtractionFiles: (extractionList) => {
        module.exports.readFiles(extractionList).subscribe(value => {
            try {
                xml2js.parseString(value.content, (err, result) => {
                    // filter for the source file/ / source language
                    const filteredList = [];
                    result.xliff.file.forEach(item => {
                        if (item.$['source-language'] === item.$['target-language'] || item.$['target-language'] === undefined) {
                            filteredList.push(item);
                        }
                    });
                    if (filteredList.length > 0) {
                        // build new entry
                        const temp = module.exports.generateXLFTemplate('hello I want to be translated', 'a description type thing');
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
                    }
                });
            } catch (e) {
                console.error(e);
            }
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