export declare class SmartTranslate {
    private translateFilePath;
    private translations;
    constructor();
    private _loadTranslationFile();
    setFilePath(path: string): void;
    getText(text: string): string;
}
