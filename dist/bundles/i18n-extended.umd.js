(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core'], factory) :
    (factory((global['i18n-extended'] = global['i18n-extended'] || {}),global.ng.core));
}(this, (function (exports,i0) { 'use strict';

var I18N_EXTENDED_DATA = new i0.InjectionToken('I18N_EXTENDED_DATA');
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
            for (var i = 0; i < variables.length; i++) {
                t = t.replace('i18nExtendedVariable', String(variables[i]));
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
        { type: i0.Injectable, args: [{
                    providedIn: 'root'
                },] },
    ];
    /** @nocollapse */
    i18nExtended.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: i0.Inject, args: [I18N_EXTENDED_DATA,] }, { type: i0.Optional }] }
    ]; };
    i18nExtended.ngInjectableDef = i0.defineInjectable({ factory: function i18nExtended_Factory() { return new i18nExtended(i0.inject(I18N_EXTENDED_DATA, 8)); }, token: i18nExtended, providedIn: "root" });
    return i18nExtended;
}());

var i18nExtendedDirective = /** @class */ (function () {
    function i18nExtendedDirective(el, i18n) {
        this.el = el;
        this.i18n = i18n;
    }
    i18nExtendedDirective.prototype.ngOnInit = function () {
        this.translate();
    };
    i18nExtendedDirective.prototype.ngOnChanges = function () {
        this.translate();
    };
    i18nExtendedDirective.prototype.translate = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.el.nativeElement.childNodes && _this.el.nativeElement.childNodes[0] && _this.el.nativeElement.childNodes[0].nodeValue) {
                if (_this.i18nExtended) {
                    _this.el.nativeElement.innerText = _this.i18n.translateText(_this.el.nativeElement.childNodes[0].nodeValue, _this.i18nExtended);
                }
                else {
                    _this.el.nativeElement.innerText = _this.i18n.translateText(_this.el.nativeElement.childNodes[0].nodeValue);
                }
            }
        });
    };
    i18nExtendedDirective.decorators = [
        { type: i0.Directive, args: [{ selector: '[i18nExtended]' },] },
    ];
    /** @nocollapse */
    i18nExtendedDirective.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: i18nExtended }
    ]; };
    i18nExtendedDirective.propDecorators = {
        i18nExtended: [{ type: i0.Input }]
    };
    return i18nExtendedDirective;
}());

var i18nExtendedDirectiveModule = /** @class */ (function () {
    function i18nExtendedDirectiveModule() {
    }
    i18nExtendedDirectiveModule.decorators = [
        { type: i0.NgModule, args: [{
                    declarations: [
                        i18nExtendedDirective,
                    ],
                    exports: [
                        i18nExtendedDirective,
                    ],
                },] },
    ];
    return i18nExtendedDirectiveModule;
}());

var i18nExtendedModule = /** @class */ (function () {
    function i18nExtendedModule() {
    }
    i18nExtendedModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [
                        i18nExtendedDirectiveModule
                    ],
                    exports: [
                        i18nExtendedDirectiveModule,
                    ],
                },] },
    ];
    return i18nExtendedModule;
}());

exports.i18nExtendedModule = i18nExtendedModule;
exports.I18N_EXTENDED_DATA = I18N_EXTENDED_DATA;
exports.i18nExtended = i18nExtended;

Object.defineProperty(exports, '__esModule', { value: true });

})));
