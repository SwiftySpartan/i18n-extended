import { Directive, ElementRef } from '@angular/core';
import { i18nExtended } from '../services/i18n-extended';
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
        { type: Directive, args: [{ selector: '[i18nExtended]' },] },
    ];
    /** @nocollapse */
    i18nExtendedDirective.ctorParameters = function () { return [
        { type: ElementRef },
        { type: i18nExtended }
    ]; };
    return i18nExtendedDirective;
}());
export { i18nExtendedDirective };
//# sourceMappingURL=i18n-extended.directive.js.map