import { Directive, ElementRef, OnInit } from '@angular/core';
import { i18nExtended } from '../services/i18n-extended';

@Directive({selector: '[i18nExtended]'})
export class i18nExtendedDirective implements OnInit {

	constructor(private el: ElementRef, private i18n: i18nExtended) {}

	ngOnInit() {
		if (this.el.nativeElement.childNodes && this.el.nativeElement.childNodes[0] && this.el.nativeElement.childNodes[0].nodeValue) {
			this.el.nativeElement.innerText = this.i18n.translateText(this.el.nativeElement.childNodes[0].nodeValue)
		}
	}
}
