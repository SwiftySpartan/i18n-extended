import { InjectionToken } from '@angular/core';
export declare const I18N_EXTENDED_DATA: InjectionToken<string>;
export declare class i18nExtended {
    i18nData: any;
    private language;
    private files;
    constructor(i18nData?: any);
    private getTranslationFile();
    setLanguage(langCode: string): void;
    translateText(text: string): string;
}
