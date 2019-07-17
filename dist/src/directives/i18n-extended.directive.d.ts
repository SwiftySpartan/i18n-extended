import { ElementRef, OnInit, OnChanges } from '@angular/core';
import { i18nExtended } from '../services/i18n-extended';
export declare class i18nExtendedDirective implements OnInit, OnChanges {
    private el;
    private i18n;
    i18nExtended: Array<string | number>;
    constructor(el: ElementRef, i18n: i18nExtended);
    ngOnInit(): void;
    ngOnChanges(): void;
    private translate();
}
