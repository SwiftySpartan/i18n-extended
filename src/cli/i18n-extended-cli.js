#!/usr/bin/env node
const fileManager = require("./file-manager");
const { red, white, green, bold, grey } = require('kleur');

fileManager.getFiles()
.then(val => {
    console.log(bold().green(`Extracting:`));
    fileManager.readFiles(val).subscribe(subVal => {
        let dataFromFile = fileManager.getTsTranslationsFromFile(subVal.content);
        if (dataFromFile) {
            const parsedDataList = fileManager.parseExtractionList(dataFromFile);
            console.log(bold().green(subVal.name));
            fileManager.geti18nExtractionFiles().subscribe(extractionFiles => {
                fileManager.appendi18nExtractionFiles(extractionFiles);
            });
        }
    });
}).catch((err) => {
    console.log(err);
    return;
});
