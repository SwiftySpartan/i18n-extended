import { Injectable, Inject, Optional, InjectionToken } from '@angular/core';
import * as i0 from "@angular/core";
export var I18N_EXTENDED_DATA = new InjectionToken('I18N_EXTENDED_DATA');
var i18nExtended = /** @class */ (function () {
    function i18nExtended(i18nData) {
        this.i18nData = i18nData;
        this.language = 'en';
        if (!this.files) {
            this.files = this.i18nData();
        }
        else {
            // Incase we cannot get the data or fidn the files just return default
            // text
            this.files = [''];
        }
    }
    i18nExtended.prototype.getTranslationFile = function () {
        var _this = this;
        return this.files.filter(function (item) { return item.includes("target-language=\"" + _this.language + "\""); })[0];
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
            var translation = [];
            translation = list.filter(function (item) {
                return item.source[0] === text;
            });
            if (translation.length === 0) {
                translation = list.filter(function (item) {
                    var target = item.source[0];
                    if (typeof target === 'object' && target['_']) {
                        target = target['_'];
                    }
                    if (typeof target === 'string') {
                        target.toLowerCase();
                    }
                    return target === text.toLowerCase();
                });
            }
            if (translation.length === 0) {
                for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                    var item = list_1[_i];
                    if (text.includes(item.source[0])) {
                        translatedString = item.target[0] + text.split(item.source[0])[1];
                    }
                }
            }
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
    i18nExtended.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Inject, args: [I18N_EXTENDED_DATA,] }, { type: Optional }] }
    ]; };
    i18nExtended.ngInjectableDef = i0.defineInjectable({ factory: function i18nExtended_Factory() { return new i18nExtended(i0.inject(I18N_EXTENDED_DATA, 8)); }, token: i18nExtended, providedIn: "root" });
    return i18nExtended;
}());
export { i18nExtended };
//# sourceMappingURL=i18n-extended.js.map