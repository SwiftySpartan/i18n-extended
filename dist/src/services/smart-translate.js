import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
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
        { type: Injectable, args: [{
                    providedIn: 'root'
                },] },
    ];
    /** @nocollapse */
    SmartTranslate.ctorParameters = function () { return []; };
    SmartTranslate.ngInjectableDef = i0.defineInjectable({ factory: function SmartTranslate_Factory() { return new SmartTranslate(); }, token: SmartTranslate, providedIn: "root" });
    return SmartTranslate;
}());
export { SmartTranslate };
//# sourceMappingURL=smart-translate.js.map