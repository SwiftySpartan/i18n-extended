import { Directive, ElementRef, Input } from '@angular/core';
import { i18nExtended } from '../services/i18n-extended';
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
        { type: Directive, args: [{ selector: '[i18nExtended]' },] },
    ];
    /** @nocollapse */
    i18nExtendedDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: i18nExtended }
    ]; };
    i18nExtendedDirective.propDecorators = {
        i18nExtended: [{ type: Input }]
    };
    return i18nExtendedDirective;
}());
export { i18nExtendedDirective };
//# sourceMappingURL=i18n-extended.directive.js.map