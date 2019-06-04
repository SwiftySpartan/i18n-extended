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
            fs.readFile(extractionList[i], 'utf8', (err, fileContent) => {
                if (fileContent.includes('target-language=')) {
                    return;
                }
                const index = fileContent.indexOf('</body>')
                const nexText = module.exports.generateTranslationEntry()
                const _bodySplit = fileContent.split('</body>')[1]
                if (_bodySplit) {
                    observe.error('Invalid xlf file')
                }
                const bodyGap = _bodySplit.split('</file>')[0].replace('\n', '');
                const calculatedWhiteSpaceGap = bodyGap + bodyGap;
                let injectionString = '';
                let count = 0;
                for (let item of Array.from(cacheMap)) {
                    if (fileContent.includes(`<source>${item.text}</source>`)) {
                        continue;
                    }
                    const random_id_indicator = Math.floor(Math.random() * (+999999999 - +1)) + +1;
                    const id = `${Date.now()}${random_id_indicator}i18nExtendedExtractor`;
                    const template = module.exports.generateTranslationEntry(id, item.text, item.description ? item.description : null, calculatedWhiteSpaceGap, count === 0);
                    injectionString += template;
                    count++;
                }
                const newTranslations = injectionString;
                var output = [fileContent.slice(0, index).trimRight(), newTranslations.trimRight(), fileContent.slice(index)].join('\n' + calculatedWhiteSpaceGap);
                fs.writeFile(extractionList[i], output);
                observe.next(`Finished writing to ${extractionList[i]}`);
            });
        }
        observe.complete();
    },
    generateIndexFile: (observe) => {
        module.exports.geti18nExtractionFiles().subscribe({
            next: (pathList) => {
                // check if pathList exists in current file
                if (fs.existsSync(`${module.exports.getAngularLocation()}i18n.extended.map.ts`)) {
                    fs.readFile(`${module.exports.getAngularLocation()}i18n.extended.map.ts`, 'utf8', (err, contents) => {
                        const listLen = pathList.length;
                        let match = 0;
                        for (let path of pathList) {
                            match += Math.ceil(1/(['', '', ''].length)*100);
                        }
                        if (match > 100) {
                            observe.complete()
                        } else {
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
                        }
                    });
                } else {
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
                }
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
    generateTranslationEntry: (id, message, note, whiteSpace, removeInitialWhiteSpace) => {
        if (removeInitialWhiteSpace) {
            if (note) {
                return `<trans-unit id="${id}" datatype="html">\n${whiteSpace}${whiteSpace}<source>${message}</source>\n${whiteSpace}${whiteSpace}<note priority="1" from="description">${note}</note>\n${whiteSpace}</trans-unit>\n`
            }
        
            return `<trans-unit id="${id}" datatype="html">\n${whiteSpace}${whiteSpace}<source>${message}</source>\n${whiteSpace}</trans-unit>\n`
        };

        if (note) {
        return `${whiteSpace}<trans-unit id="${id}" datatype="html">\n${whiteSpace}${whiteSpace}<source>${message}</source>\n${whiteSpace}${whiteSpace}<note priority="1" from="description">${note}</note>\n${whiteSpace}</trans-unit>\n`
        }

        return `${whiteSpace}<trans-unit id="${id}" datatype="html">\n${whiteSpace}${whiteSpace}<source>${message}</source>\n${whiteSpace}</trans-unit>\n`
    }
};
