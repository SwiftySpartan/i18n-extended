#!/usr/bin/env node
const fileManager = require("./file-manager");
const execa = require('execa');
const Listr = require('listr');
const rxjs = require('rxjs');
const { red, white, green, bold, grey } = require('kleur');

fileManager.getFiles()
.then(val => {
    const tasks = new Listr([
        {
            title: 'Extracting translations from files',
            task: () => {
                return new rxjs.Observable(observer => {
                    observer.next(`Extracting...`);
                    fileManager.readFiles(val)
                    .subscribe({
                        next(subVal) {
                            fileManager.initialTranslationsCahce.push(fileManager.getTsTranslationsFromFile(subVal.content));
                            fileManager.initialTranslationsCahce = fileManager.initialTranslationsCahce.filter(item => item != null);
                        },
                        complete() {
                            setTimeout(() => {
                                observer.complete();
                            }, 1000);
                        }
                    })
                });
            }
        },
        {
            title: 'Parsing extracted strings',
            task: () => {
                return new rxjs.Observable(observe => {
                    observe.next('Mapping strings..');
                    fileManager.parsedDataList = fileManager.parseExtractionList(fileManager.initialTranslationsCahce);
                    observe.complete();
                })
            },
        },
        {
            title: 'Find i18n source files',
            task: () => {
                return new rxjs.Observable(observe => {
                    observe.next('Finding source file...');
                    fileManager.geti18nExtractionFiles()
                        .subscribe({
                            next(extractionFiles) {
                                fileManager.i18nSourceFiles = extractionFiles;
                            },
                            complete() {
                                observe.complete();
                            }
                        });
                })
            },
        },
        {
            title: 'Append extracted files to i18n source file',
            task: () => {
                return new rxjs.Observable(observe => {
                    fileManager.appendi18nExtractionFiles(fileManager.i18nSourceFiles, fileManager.parsedDataList, observe);
                })
            },
        }
    ]);
    tasks.run().catch(err => {
        console.error(err);
    });
}).catch((err) => {
    console.log(err);
    return;
});


// if (dataFromFile) {

// }

// fileManager.geti18nExtractionFiles().subscribe(extractionFiles => {
//         observer.next(`Appending translations to source file`);
//         fileManager.appendi18nExtractionFiles(extractionFiles, parsedDataList);
//     });

//fileManager.appendi18nExtractionFiles(extractionFiles, parsedDataList);