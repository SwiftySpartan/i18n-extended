import { ElementRef, OnInit } from '@angular/core';
import { i18nExtended } from '../services/i18n-extended';
export declare class i18nExtendedDirective implements OnInit {
    private el;
    private i18n;
    constructor(el: ElementRef, i18n: i18nExtended);
    ngOnInit(): void;
}
