import { NgModule } from '@angular/core';

import { i18nExtendedDirective } from './i18n-extended.directive';

@NgModule({
	declarations: [
		i18nExtendedDirective,
	],
	exports: [
		i18nExtendedDirective,
	],
})
export class i18nExtendedDirectiveModule { }
