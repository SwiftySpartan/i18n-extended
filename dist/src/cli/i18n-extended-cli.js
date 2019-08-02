const fileManager = require("./file-manager");
const Listr = require('listr');
const rxjs = require('rxjs');
const { bold} = require('kleur');
const process = require('process');
const prompts = require('prompts');
const fs = require('fs-extra');

process.argv.forEach(arg => {
    if (arg.includes('--project=')) {
        fileManager.targetAngularProject =arg.replace('--project=', '')
    };
});

const tasks = new Listr([
    {
        title: 'Finding Angular app...',
        task: () => {
            return fileManager.setAngularDirectory(process.cwd());
        }
    },
]);
tasks.run().then(() => {
    const fileList = fileManager.angularProjects;
    if (fileList.length > 1) {
        console.log(bold().yellow('\n We have found more than one Angular app!'));
        (async () => {
            let projectList = ' ';
            let counter = 0;
            for (let project of fileList) {
                projectList += `${counter}: ${project}\n  `;
                counter++;
            }
            const promptMessage = `Which app would you like to use? \n ${projectList} \n Please enter the number for selecting the app:`;
            const response = await prompts({
                type: 'number',
                name: 'value',
                message: promptMessage
            });

            console.log(bold().green('Using: ') + bold(`${fileList[response.value]}`));
            fileManager.defaultProject = response.value;
        })().then(() => {
            runServiceInstall(fileManager.angularProjects[fileManager.defaultProject]);
        });
    } else if (fileList.length > 0) {
        module.exports.defaultProject = 0;
        runServiceInstall(fileManager.angularProjects[fileManager.defaultProject]);
    } else {
        console.log(bold().yellow('  Cannot find Angular app'));
        console.log(bold().red('  This can happen if you are trying to execute this command in a nested directory of your Angular app'));
        console.log(bold().red('  Make sure you are at the root of Angular app' ));
        console.log(bold().yellow('  The root is where the angular.json file sits'));
    }
}).catch((err) => {
    return console.log(err);
});

function runServiceInstall(path) {
    if (fs.existsSync(path +'node_modules/@andrewwormald/i18n-extended')) {
        // Run main program
        main();
    } else {
        const serviceTasks = new Listr([
            {
                title: 'Creating i18n Service in Angular app',
                task: () => {
                    return fileManager.installService(path);
                }
            },
        ]);
        serviceTasks.run().then(() => {
            // Run main program
            main();
        }).catch((err) => {
            return console.log(err);
        });
    }
}

function main() {
    fileManager.getFiles()
    .then(val => {
        if (!val) {
            console.log(bold().red('Please run the command in an Angular directory'));
            return;
        }
        const mainTasks = new Listr([
            {
                title: 'Extracting translations from files',
                task: () => {
                    return new rxjs.Observable(observe => {
                        observe.next(`Extracting...`);
                        fileManager.readFiles(val)
                        .subscribe({
                            next(subVal) {
                                if (subVal && fileManager.getTsTranslationsFromFile(subVal.content)) {
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
                title: 'Finding i18n source files',
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
                title: 'Appending extracted strings to i18n source file',
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
        mainTasks.run().catch(() => {
            return;
        });
    }).catch((err) => {
        return console.error(err);
    });
}