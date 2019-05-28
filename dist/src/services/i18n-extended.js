import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
var files = require("./i18n-extended-translation-data");
var i18nExtended = /** @class */ (function () {
    function i18nExtended() {
        this.language = 'en';
    }
    i18nExtended.prototype.getTranslationFile = function () {
        var _this = this;
        return files.getTranslationStrings().filter(function (item) { return item.includes("target-language=\"" + _this.language + "\""); })[0];
    };
    i18nExtended.prototype.setLanguage = function (langCode) {
        this.language = langCode;
    };
    i18nExtended.prototype.translateText = function (text) {
        var translatedString = text;
        var file = this.getTranslationFile();
        if (!file) {
            return translatedString;
        }
        var parseString = require('xml2js').parseString;
        parseString(file, function (err, result) {
            if (err) {
                console.error(err);
                return translatedString;
            }
            var list = result.xliff.file[0].body[0]['trans-unit'];
            var translation = list.filter(function (item) {
                return item.source[0] === text;
            });
            if (translation && translation.length > 0) {
                translatedString = translation[0].target[0];
            }
        });
        return translatedString;
    };
    i18nExtended.decorators = [
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] },
    ];
    /** @nocollapse */
    i18nExtended.ctorParameters = function () { return []; };
    i18nExtended.ngInjectableDef = i0.defineInjectable({ factory: function i18nExtended_Factory() { return new i18nExtended(); }, token: i18nExtended, providedIn: "root" });
    return i18nExtended;
}());
export { i18nExtended };
//# sourceMappingURL=i18n-extended.js.map