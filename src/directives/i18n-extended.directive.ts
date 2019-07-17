import { Directive, ElementRef, OnInit, OnChanges, Input } from '@angular/core';
import { i18nExtended } from '../services/i18n-extended';

@Directive({selector: '[i18nExtended]'})
export class i18nExtendedDirective implements OnInit, OnChanges {
	@Input() i18nExtended: Array<string | number>;

	constructor(private el: ElementRef, private i18n: i18nExtended) {
	}

	ngOnInit() {
		this.translate();
	}

	ngOnChanges() {
		this.translate();
	}

	private translate() {
		setTimeout(() => {
			if (this.el.nativeElement.childNodes && this.el.nativeElement.childNodes[0] && this.el.nativeElement.childNodes[0].nodeValue) {
				if (this.i18nExtended) {
					this.el.nativeElement.innerText = this.i18n.translateText(this.el.nativeElement.childNodes[0].nodeValue, this.i18nExtended)
				} else {
					this.el.nativeElement.innerText = this.i18n.translateText(this.el.nativeElement.childNodes[0].nodeValue)
				}
			}
		})
	}
}
