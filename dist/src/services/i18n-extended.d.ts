import { InjectionToken } from '@angular/core';
export declare const I18N_EXTENDED_DATA: InjectionToken<string>;
export declare class i18nExtended {
    i18nData: any;
    private language;
    private files;
    constructor(i18nData?: any);
    private getTranslationFile();
    setLanguage(langCode: string): void;
    translateText(text: string, variables?: Array<string | number>, description?: string): string;
    private cottonReplaceAlogithm(text, units, variables?);
    private isTranslation(text, source, variables?);
    private breakSentanceIntoChars(text);
    private removeInterpolation(text);
    private hasInterpretation(text);
    private digestTranslation(ct, source, target, variables?);
}
