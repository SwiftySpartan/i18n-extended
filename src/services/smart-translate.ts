import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SmartTranslate {
  private translations: Array<{source: string, target: string}>;

  constructor() { }

  //Private

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