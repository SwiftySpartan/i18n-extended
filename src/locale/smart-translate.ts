import { Injectable } from '@angular/core';

declare const require;

@Injectable({
  providedIn: 'root'
})
export class SmartTranslate {
  private static translateFilePath: string;
  private static translations: Array<{source: string, target: string}>;

  constructor() { }

  //Private
  private _loadTranslationFile() {
    const t =`raw-loader!${SmartTranslate.translateFilePath}`;
    console.log(t);
    console.log('raw-loader!../../../../wallet/src/locale/fr/wallet.xlf')
    console.log(t === 'raw-loader!../../../../wallet/src/locale/fr/wallet.xlf')
    const file = require(t);
    console.log(file);
    const parseString = require('xml2js').parseString;
    parseString(file, (err, result) => {
      SmartTranslate.translations = [];
      for (let item of result.xliff.file[0].body[0]['trans-unit']) {
        SmartTranslate.translations.push({
          source: item.source,
          target: item.target
        })
      }
    });
  }

  // Public
  public setFilePath(path: string) {
    SmartTranslate.translateFilePath = path;
    try {
      this._loadTranslationFile();
    } catch (e) {
      console.error(e);
    }
  }

  public getText(text: string) {
    if (!SmartTranslate.translations) {
      console.warn('Cannot find translation file');
      return text;
    }
    const result = SmartTranslate.translations.filter((item) => {
      if (item.source[0] === text) {
        return item.target[0];
      }
    });

    return result[0].target[0];
  }
}
