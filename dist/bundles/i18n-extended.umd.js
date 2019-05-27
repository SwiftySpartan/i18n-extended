(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :
    (factory((global['i18n-extended'] = global['i18n-extended'] || {}),global.ng.core,global._angular_common));
}(this, (function (exports,i0,_angular_common) { 'use strict';

var SmartTranslate = /** @class */ (function () {
    function SmartTranslate() {
    }
    //Private
    SmartTranslate.prototype.translate = function (text) {
        if (!this.translations) {
            console.warn('Cannot find translation file');
            return text;
        }
        var result = this.translations.filter(function (item) {
            if (item.source[0] === text) {
                return item.target[0];
            }
        });
        return result[0].target[0];
    };
    SmartTranslate.decorators = [
        { type: i0.Injectable, args: [{
                    providedIn: 'root'
                },] },
    ];
    /** @nocollapse */
    SmartTranslate.ctorParameters = function () { return []; };
    SmartTranslate.ngInjectableDef = i0.defineInjectable({ factory: function SmartTranslate_Factory() { return new SmartTranslate(); }, token: SmartTranslate, providedIn: "root" });
    return SmartTranslate;
}());

var SmartTranslateModule = /** @class */ (function () {
    function SmartTranslateModule() {
    }
    SmartTranslateModule.decorators = [
        { type: i0.NgModule, args: [{
                    imports: [
                        _angular_common.CommonModule,
                    ],
                    providers: [
                        SmartTranslate,
                    ],
                },] },
    ];
    return SmartTranslateModule;
}());

// 1) Create a indexed file for the service to read and load into memory
// 2) test, test, and test with a new angular project locally
// 3) Finish smart-translate service and receive translations
// 4) Construct README.md file and publish to the world!

exports.SmartTranslate = SmartTranslate;
exports.SmartTranslateModule = SmartTranslateModule;

Object.defineProperty(exports, '__esModule', { value: true });

})));
