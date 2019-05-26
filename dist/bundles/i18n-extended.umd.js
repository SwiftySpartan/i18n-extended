(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('@angular/common')) :
    typeof define === 'function' && define.amd ? define(['exports', '@angular/core', '@angular/common'], factory) :
    (factory((global['i18n-extended'] = global['i18n-extended'] || {}),global.ng.core,global._angular_common));
}(this, (function (exports,i0,_angular_common) { 'use strict';

var SmartTranslate = /** @class */ (function () {
    function SmartTranslate() {
    }
    //Private
    SmartTranslate.prototype._loadTranslationFile = function () {
        var _this = this;
        var t = "raw-loader!" + this.translateFilePath;
        console.log(t);
        console.log('raw-loader!../../../../wallet/src/locale/fr/wallet.xlf');
        console.log(t === 'raw-loader!../../../../wallet/src/locale/fr/wallet.xlf');
        var file = require(t);
        console.log(file);
        var parseString = require('xml2js').parseString;
        parseString(file, function (err, result) {
            _this.translations = [];
            for (var _i = 0, _a = result.xliff.file[0].body[0]['trans-unit']; _i < _a.length; _i++) {
                var item = _a[_i];
                _this.translations.push({
                    source: item.source,
                    target: item.target
                });
            }
        });
    };
    // Public
    SmartTranslate.prototype.setFilePath = function (path) {
        this.translateFilePath = path;
        try {
            this._loadTranslationFile();
        }
        catch (e) {
            console.error(e);
        }
    };
    SmartTranslate.prototype.getText = function (text) {
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

// 1) index and generate a map of information about angular.json config
//    inside the node package
// https://github.com/SwiftySpartan/Angular-1.5-cli
//https://medium.com/javascript-in-plain-english/typescript-with-node-and-express-js-why-when-and-how-eb6bc73edd5d
// 2) Use static files generated in step 1 to provide db to
//    smart-translate service
// 3) Finish smart-translate service and receive translations

exports.SmartTranslate = SmartTranslate;
exports.SmartTranslateModule = SmartTranslateModule;

Object.defineProperty(exports, '__esModule', { value: true });

})));
