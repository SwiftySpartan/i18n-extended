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
    } else {
      // Incase we cannot get the data or fidn the files just return default
      // text
      this.files = [''];
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
    try {
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
          var target = item.source[0];
          if (typeof target === 'object' && target['_']) {
            target = target['_']
          }
          if (typeof target === 'string') {
            target = target.toLowerCase();
          }
          return target === text.toLowerCase();
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
    } catch(e) {
      return translatedString;  
    }
    return translatedString;
  }

  private cottonReplaceAlogithm(text: string, units: Array<any>): string {
    let translatedText = '';

    if (typeof text != 'string' || !text) {
      return translatedText;
    }

    if (!units) {
      return translatedText;
    }

    if (units && !units[0].source) {
      return translatedText
    }

    if (units && !units[0].target) {
			return translatedText
    }


    for (let unit of units) {
      let s = unit.source[0];
			let t = unit.target[0];

			// Check if the unit has a source and target
			// exit the loop if one doesn't exist
			if (!s || !t) {
			  continue;
			}
      // String
      if (typeof s === 'string' && s === text) {
				// Go straight to the end of the method and returns the string
				translatedText = t;
				break;
      }

      // Generic Object
			if (typeof s === 'object') {
			  // Array
			  if (Array.isArray(s)) {
			    // Will support this once I see it coming through for the first time
          continue;
			  }

			  // Map
				if (s && !Array.isArray(s) && s._ && typeof s._ === 'string') {
          // string sits at `_`
          // interpolation sits at `x` which is a list of objects
          // total sting length = x.length + _.split(' ').length *UNPROVEN*
          let ul = 0;
          if (!s.x || s.x && !Array.isArray(s.x)) {
						ul = s._.split(' ').length + s.x.length;
          } else {
            ul = s._.split(' ').length;
          }

          // Length of computed text and compiled unit
          // should be equal if its going to be a match
          // also the unit text should be found in the given
          // text that needs to be translated
          if (text.length === ul && text.includes(s._)) {
            translatedText = text.replace(s._, t._);
            break;
          }
				}
			}
    }
    // return what has been found return not done before as
    // you want to ensure a direct match gets returned over a
    // close match and therefore needs to finish running through the list
    return translatedText;
  }
}
