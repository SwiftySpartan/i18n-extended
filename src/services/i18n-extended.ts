import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';

declare const require: any;

export const I18N_EXTENDED_DATA = new InjectionToken<string>('I18N_EXTENDED_DATA');

@Injectable({
  providedIn: 'root'
})
export class i18nExtended {
  private language: string = 'en';
  private files: [string];

  constructor(@Inject(I18N_EXTENDED_DATA) @Optional() public i18nData?: any) {
    if (!this.files) {
      this.files = this.i18nData();
    }
  }

  private getTranslationFile() {
    return this.files.filter((item:string) => item.includes(`target-language="${this.language}"`))[0];
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
      let translation = [];
      translation = list.filter(item => {
        return item.source[0] === text;
      });

      if (translation.length === 0) {
        translation = list.filter(item => {
          return item.source[0].toLowerCase() === text.toLowerCase();
        });
      }

      if (translation.length === 0) {
        for (let item of list) {
          if (text.includes(item.source[0])) {
            translatedString = item.target[0] +  text.split(item.source[0])[1];
          }
        }
      }

      if (translation && translation.length > 0) {
        translatedString = translation[0].target[0];
      }
    });
    return translatedString;
  }
}
