import { Injectable } from '@angular/core';

declare const require: any;

@Injectable({
  providedIn: 'root'
})
export class SmartTranslate {
  private translateFilePath: string;
  private translations: Array<{source: string, target: string}>;

  constructor() { }

  //Private
  private _loadTranslationFile() {
    const t =`raw-loader!${this.translateFilePath}`;
    const file = require(t);
    const parseString = require('xml2js').parseString;
    parseString(file, (err: any, result: any) => {
      this.translations = [];
      for (let item of result.xliff.file[0].body[0]['trans-unit']) {
        this.translations.push({
          source: item.source,
          target: item.target
        })
      }
    });
  }

  public translate(text: string) {
    if (!this.translations) {
      console.warn('Cannot find translation file');
      return text;
    }
    const result = this.translations.filter((item) => {
      if (item.source[0] === text) {
        return item.target[0];
      }
    });

    return result[0].target[0];
  }
}