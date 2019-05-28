import { Injectable } from '@angular/core';

declare const require: any;
const files = require("./i18n-extended-translation-data");

@Injectable({
  providedIn: 'root'
})
export class i18nExtended {
  private language: string = 'en';

  constructor() {}

  private getTranslationFile() {
    return files.getTranslationStrings().filter((item:string) => item.includes(`target-language="${this.language}"`))[0];
  }

  public setLanguage(langCode: string) {
    this.language = langCode;
  }

  public translateText(text: string) {
    let translatedString = text;
    const file = this.getTranslationFile() as string;
    if (!file) {
      return translatedString;
    }
    const parseString = require('xml2js').parseString;
    parseString(file, (err: any, result: any) => {
      if (err) {
        console.error(err);
        return translatedString;
      }
      const list = result.xliff.file[0].body[0]['trans-unit'] as Array<any>;
      const translation = list.filter(item => {
        return item.source[0] === text;
      });
      if (translation && translation.length > 0) {
        translatedString = translation[0].target[0];
      }
    });
    return translatedString;
  }
}
