var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@angular/core';
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
    SmartTranslate = __decorate([
        Injectable({
            providedIn: 'root'
        })
    ], SmartTranslate);
    return SmartTranslate;
}());
export { SmartTranslate };
//# sourceMappingURL=smart-translate.js.map