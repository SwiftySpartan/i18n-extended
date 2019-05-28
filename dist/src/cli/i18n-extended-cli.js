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
                return new rxjs.Observable(observe => {
                    observe.next(`Extracting...`);
                    fileManager.readFiles(val)
                    .subscribe({
                        next(subVal) {
                            if (fileManager.getTsTranslationsFromFile(subVal.content)) {
                                fileManager.initialTranslationsCahce.push.apply(fileManager.initialTranslationsCahce, fileManager.getTsTranslationsFromFile(subVal.content));
                                fileManager.initialTranslationsCahce = fileManager.initialTranslationsCahce.filter(item => item != null);
                            }
                        },
                        complete() {
                            observe.complete();
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
                        },
                        error(e) {
                            observe.error(e)
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
        },
        {
            title: 'Index translation paths for i18n-extended service',
            task: () => {
                return new rxjs.Observable(observe => {
                    fileManager.generateIndexFile(observe);
                })
            },
        }
    ]);
    tasks.run().catch(() => {
        return;
    });
}).catch((err) => {
    return;
});