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
    i18nExtended.prototype.translateText = function (text, variables, description) {
        var translatedString = text;
        try {
            var file = this.getTranslationFile();
            if (!file) {
                return translatedString;
            }
            var sources = file.match(/<source\b[^>]*>(.*?)<[/]source>/g);
            var targets = file.match(/<target\b[^>]*>(.*?)<[/]target>/g);
            if (!sources || !targets) {
                return text;
            }
            var translationObject = [];
            for (var i = 0; i < sources.length; i++) {
                if (i === 0) {
                    translationObject = [{
                            source: sources[i].replace(/<source\b[^>]*>/g, '').replace(/<[/]source>/g, ''),
                            target: targets[i].replace(/<target\b[^>]*>/g, '').replace(/<[/]target>/g, ''),
                        }];
                }
                else {
                    translationObject.push({
                        source: sources[i].replace(/<source\b[^>]*>/g, '').replace(/<[/]source>/g, ''),
                        target: targets[i].replace(/<target\b[^>]*>/g, '').replace(/<[/]target>/g, ''),
                    });
                }
            }
            translatedString = this.cottonReplaceAlogithm(text, translationObject, variables);
        }
        catch (e) {
            return translatedString;
        }
        return translatedString;
    };
    i18nExtended.prototype.cottonReplaceAlogithm = function (text, units, variables) {
        var translatedText = text;
        if (typeof text != 'string' || !text) {
            return translatedText;
        }
        if (!units) {
            return translatedText;
        }
        for (var _i = 0, units_1 = units; _i < units_1.length; _i++) {
            var unit = units_1[_i];
            var s = unit.source;
            var t = unit.target;
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
    };
    i18nExtended.prototype.isTranslation = function (text, source, variables) {
        var matCnt = 0;
        var te = this.breakSentanceIntoChars(text);
        var se = this.breakSentanceIntoChars(this.removeInterpolation(source));
        if (!se || !te) {
            return false;
        }
        if (variables) {
            var string = source;
            for (var i_1 = 0; i_1 < variables.length; i_1++) {
                string = string.replace(/<x\b[^>]*>/, String(variables[i_1]));
            }
            if (string.trim() === text.trim()) {
                return true;
            }
        }
        // Length of computed text and compiled unit
        // should be equal if its a literal and going
        // to be a match also the unit text should be
        // found in the given text that needs to be
        // translated
        var t = source.replace(/<x\b[^>]*>/g, '');
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
        var _variableCount = this.removeInterpolation(source).match(/i18nExtendedVariable/g);
        if (matCnt > 0 && _variableCount) {
            var variableCount = _variableCount.length;
            if (matCnt + variableCount === te.length) {
                return true;
            }
        }
        return false;
    };
    i18nExtended.prototype.breakSentanceIntoChars = function (text) {
        return text.match(/\w+|[^\s\w]+/g);
    };
    i18nExtended.prototype.removeInterpolation = function (text) {
        return text.replace(/<x\b[^>]*>/g, 'i18nExtendedVariable');
    };
    i18nExtended.prototype.fetchInterpolationNames = function (text) {
        return text.match(/<x\b[^>]*>/g);
    };
    i18nExtended.prototype.hasInterpretation = function (text) {
        var matches = text.match(/<x\b[^>]*>/g);
        if (!matches) {
            return false;
        }
        return matches.length > 0;
    };
    i18nExtended.prototype.digestTranslation = function (ct, source, target, variables) {
        var t = this.removeInterpolation(target);
        var cText = this.breakSentanceIntoChars(ct);
        var cSrc = this.breakSentanceIntoChars(this.removeInterpolation(source));
        var cTar = this.breakSentanceIntoChars(t);
        if (!cSrc || !cTar || !cText) {
            return ct;
        }
        if (variables) {
            var sList = this.fetchInterpolationNames(source);
            var tList = this.fetchInterpolationNames(target);
            var orderedVariables = [];
            if (tList && sList) {
                // reorder list
                for (var i = 0; i < variables.length; i++) {
                    orderedVariables.splice(tList.indexOf(sList[i]), 0, String(variables[i]));
                }
            }
            for (var i = 0; i < orderedVariables.length; i++) {
                t = t.replace('i18nExtendedVariable', String(orderedVariables[i]));
            }
            return t;
        }
        var tm = [];
        for (var i = 0; i < cText.length; i++) {
            var wi = cText.indexOf(cSrc[i]);
            if (wi === -1) {
                tm.push(cText[i]);
            }
        }
        for (var i = 0; i < tm.length; i++) {
            t = t.replace('i18nExtendedVariable', tm[i]);
        }
        return t;
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