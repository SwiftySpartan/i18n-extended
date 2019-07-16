import { NgModule } from '@angular/core';
import { i18nExtendedDirectiveModule } from './directives/i18n-extended-directive.module';

@NgModule({
	imports: [
		i18nExtendedDirectiveModule
	],
	exports: [
		i18nExtendedDirectiveModule,
	],
})
export class i18nExtendedModule { }
