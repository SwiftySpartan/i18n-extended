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
        var element = this.el.nativeElement;
        element.innerHTML = this.i18n.translateText(element.innerHTML);
    };
    i18nExtendedDirective.decorators = [
        { type: i0.Directive, args: [{ selector: '[i18nExtended]' },] },
    ];
    /** @nocollapse */
    i18nExtendedDirective.ctorParameters = function () { return [
        { type: i0.ElementRef },
        { type: i18nExtended }
    ]; };
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
