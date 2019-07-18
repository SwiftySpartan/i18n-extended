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

  public translateText(text: string, variables?: Array<string | number>, description?: string) {
    let translatedString = text;
    try {
      const file = this.getTranslationFile() as string;
    if (!file) {
      return translatedString;
    }
    const sources = file.match(/<source\b[^>]*>(.*?)<[/]source>/g);
    const targets = file.match(/<target\b[^>]*>(.*?)<[/]target>/g);

    if (!sources || !targets) {
    	return text;
    }

		let translationObject: TranslationUnit[] = [];
    for (let i = 0; i < sources.length; i++) {
    	if (i === 0) {
    		translationObject = [{
					source: sources[i].replace(/<source\b[^>]*>/g, '').replace(/<[/]source>/g, ''),
					target: targets[i].replace(/<target\b[^>]*>/g, '').replace(/<[/]target>/g, ''),
				}]
    	} else {
				translationObject.push({
					source: sources[i].replace(/<source\b[^>]*>/g, '').replace(/<[/]source>/g, ''),
					target: targets[i].replace(/<target\b[^>]*>/g, '').replace(/<[/]target>/g, ''),
				});
    	}
    }

    translatedString = this.cottonReplaceAlogithm(text, translationObject, variables);
    } catch(e) {
      return translatedString;  
    }
    return translatedString;
  }

  private cottonReplaceAlogithm(text: string, units: TranslationUnit[], variables?:  Array<string | number>): string {
    let translatedText = text;

    if (typeof text != 'string' || !text) {
      return translatedText;
    }

    if (!units) {
      return translatedText;
    }

    for (let unit of units) {
      let s = unit.source;
			let t = unit.target;

			// Check if the unit has a source and target
			// exit the loop if one doesn't exist
			if (!s || !t) {
			  continue;
			}
      // Simple quick find
      if (typeof s === 'string' && s === text) {
				// Go straight to the end of the method and returns the string
				translatedText = t;
				break;
      }

      if (variables && this.isTranslation(text, s, variables)) {
				translatedText = this.digestTranslation(text, s, t, variables);
      	break;
      }

      if (this.hasInterpretation(s) && this.isTranslation(text, s)) {
				translatedText = this.digestTranslation(text, s, t);
				break;
      }
    }
    // return what has been found return not done before as
    // you want to ensure a direct match gets returned over a
    // close match and therefore needs to finish running through the list
    if (!translatedText) {
      translatedText = text;
    }
    return translatedText;
  }

  private isTranslation(text: string, source: string, variables?: Array<string | number>): boolean {
		let matCnt = 0;
		const te = this.breakSentanceIntoChars(text);
		const se = this.breakSentanceIntoChars(this.removeInterpolation(source));
		if (!se || !te) {
			return false;
		}

		if (variables) {
			let string = source;
			for (let i = 0; i < variables.length; i++) {
				string = string.replace(/<x\b[^>]*>/, String(variables[i]));
			}
			if (string.trim() === text.trim()) {
				return true
			}
		}

		// Length of computed text and compiled unit
		// should be equal if its a literal and going
		// to be a match also the unit text should be
		// found in the given text that needs to be
		// translated
		let t = source.replace(/<x\b[^>]*>/g, '');
		if (se.length === te.length && t && text.includes(t.trim())) {
			return true;
		}

		//////////////////////////////////////////////////////////
		//  Below code should be deprecated as its not always		//
		// going to provide accurate results and is inefficient	//
		//////////////////////////////////////////////////////////

		// Use the source breakdown length over the
		// text input length as it will always be
		// equal to or less than.
		for (var i = 0; i < se.length; i++) {
			if (te.includes(se[i])) {
				matCnt++;
			}
		}
		const _variableCount = this.removeInterpolation(source).match(/i18nExtendedVariable/g);
		if (matCnt > 0 && _variableCount) {
			const variableCount = _variableCount.length;
			if (matCnt + variableCount === te.length) {
				return true;
			}
		}
		return false;
  }

  private breakSentanceIntoChars(text: string): RegExpMatchArray | null {
    return text.match(/\w+|[^\s\w]+/g);
  }

	private removeInterpolation(text: string): string {
		return text.replace(/<x\b[^>]*>/g, 'i18nExtendedVariable');
	}

	private fetchInterpolationNames(text: string): RegExpMatchArray | null {
		return text.match(/<x\b[^>]*>/g);
	}

	private hasInterpretation(text: string): boolean {
		let matches = text.match(/<x\b[^>]*>/g);
		if (!matches) {
			return false;
		}

		return matches.length  > 0;
	}

  private digestTranslation(ct: string, source: string, target: string, variables?: Array<string | number>): string {
		let t = this.removeInterpolation(target);
		const cText = this.breakSentanceIntoChars(ct);
		const cSrc = this.breakSentanceIntoChars(this.removeInterpolation(source));
		const cTar = this.breakSentanceIntoChars(t);
		if (!cSrc || !cTar || !cText) {
			return ct;
		}

		if (variables) {
			const sList = this.fetchInterpolationNames(source);
			const tList = this.fetchInterpolationNames(target);
			let orderedVariables: string[] = [];

			if (tList && sList) {
				// reorder list
				for (let i = 0; i < variables.length; i++) {
					orderedVariables.splice(tList.indexOf(sList[i]), 0, String(variables[i]));
				}
			}

			for (let i = 0; i < orderedVariables.length; i++) {
				t = t.replace('i18nExtendedVariable', String(orderedVariables[i]));
			}
			return t;
		}

		const tm = [];
		for (let i = 0; i < cText.length; i++) {
			var wi = cText.indexOf(cSrc[i]);
			if (wi === -1) {
				tm.push(cText[i]);
			}
		}

		for (let i = 0; i < tm.length; i++) {
			t = t.replace('i18nExtendedVariable', tm[i])
		}
		return t;
  }
}

interface TranslationUnit {
	source: string;
	target: string;
}