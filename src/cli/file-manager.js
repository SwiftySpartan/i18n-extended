const recursive = require("recursive-readdir");
const fs = require('fs-extra');
const {bold} = require('kleur');
const myRxjs = require('rxjs');
const cp = require("child_process");

module.exports = {
    targetAngularProject: null, // this is the project being targeted inside of the /projects/ dir
    angularProjects: [],
    defaultProject: 0,
    initialTranslationsCahce: [],
    parsedDataList: [],
    i18nSourceFiles: [],
    getFiles: () => {
        return new Promise((resolve, reject) => {
            if (module.exports.getAngularLocation()) {
                if (module.exports.targetAngularProject) {
                    recursive(module.exports.getAngularLocation() + '/projects/' + module.exports.targetAngularProject, ["*.html", "*.scss", "index.ts", "*.module.ts", "*.spec.ts", "*.js", "*.go", "*.json", "*.md", "*.directive.ts"], function (err, files) {
                        resolve(files);
                    });
                } else {
                    recursive(module.exports.getAngularLocation(), ["*.html", "*.scss", "index.ts", "*.module.ts", "*.spec.ts", "*.js", "*.go", "*.json", "*.md", "*.directive.ts"], function (err, files) {
                        resolve(files);
                    });
                }
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
            const tl = item.match(/([`"'])(?:(?=(\\?))\2.)*?\1/g);
            if (!tl) {
                return '';
            }
            let cs = '';

            if (tl.length > 1) {
                let s = item;
                for (let i = 0; i < tl.length; i++) {
                    s = s.replace(tl[i], i.toString());
                }
                if (s.includes(',')) {
                    // take last provided string as note to translator
                    parsedObject.description = tl[tl.length - 1];
                    tl.pop();
                }
            }

            tl.forEach(s => {
                cs += s;
            });

            switch (cs[0]) {
                case '`':
                    cs = cs.replace(/[`]/g, '');
                    break;
                case '"':
                    cs = cs.replace(/["]/g, '');
                    break;
                case "'":
                    cs = cs.replace(/[']/g, '');
                    break;
                default: break;
            }
            if (parsedObject.description) {
                switch (parsedObject.description[0]) {
                    case '`':
                        parsedObject.description = parsedObject.description.replace(/[`]/g, '');
                        break;
                    case '"':
                        parsedObject.description = parsedObject.description.replace(/["]/g, '');
                        break;
                    case "'":
                        parsedObject.description = parsedObject.description.replace(/[']/g, '');
                        break;
                    default: break;
                }
            }

            // Assign compiled string
            cs = cs.replace(/&(?!#?[a-z0-9]+;)/g, '&amp;');
            const regex = /((?:[\0-\x08\x0B\f\x0E-\x1F\uFFFD\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/g;
            cs = cs.replace(regex, "");

            let equivilentText = 'DO NOT DELETE';

            // detect if an anchor tag
            const aTags = cs.match(/<\s*a[^>]*>(.*?)<*\s*a>/g);
            if (aTags) {
                for (let i = 0; i < aTags.length; i++) {
                    let content = aTags[i].split('<')[1].split('>')[1].split('<')[0]; // pruned
                    const matches = aTags[i].match(/\${.*?}/g);
                    if (matches) {
                        for (let i = 0; i < matches.length; i++) {
                            equivilentText = matches[i].replace('${', '').replace('}', '');
                            if (equivilentText) {
                                cs = cs.replace(/\${.*?}/g, equivilentText);
                            }
                        }
                    }
                    cs = cs.replace(/<\s*a[^>]*>(.*?)<*\s*a>/g, `<x id="START_LINK" ctype="x-a" equiv-text="i18nExtendedLink"/>${content}<x id="CLOSE_LINK" ctype="x-a" equiv-text="i18nExtendedLink"/>`);
                }
            }

            // if its a ${} variable declaration
            const matches = cs.match(/\${.*?}/g);
            if (matches) {
                for (let i = 0; i < matches.length; i++) {
                    equivilentText = matches[i].replace('${', '').replace('}', '');
                    if (equivilentText) {
                        cs = cs.replace(/\${.*?}/g, `<x id="INTERPOLATION" equiv-text="${equivilentText}"/>`);
                    }
                }
            }

            // protect xml integrity by removing any left over tags
            // cs = cs.replace(/<[^>]*>/g, '');

            parsedObject['text'] = cs;
            return parsedObject;
        });
    },
    geti18nExtractionFiles: () => {
        return new myRxjs.Observable(observe => {
            if (module.exports.targetAngularProject) {
                recursive(module.exports.getAngularLocation() + '/projects/' + module.exports.targetAngularProject,
                    ["*.html", "*.scss", "*.ts", "*.js", "*.go", "*.cpp", "*.json", "*.md"],
                    (err, files) => {
                        const filteredFiles = files.filter(item => item.includes('xlf'));
                        observe.next(filteredFiles);
                        if (filteredFiles.length < 1) {
                            observe.error(new Error('Cannot find any i18n .xlf translation files!'));
                        }
                        observe.complete()
                    });
            } else {
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
            }
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
                    observe.next('Please check and manually update your i18n.extended.map.ts');
                } else {
                    const generateMessage = '// This file has been automatically generated by the i18n-extended cli \n// Do not modify or remove anything from this file \n \n';
                    const requireString = 'declare const require: any;';
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
