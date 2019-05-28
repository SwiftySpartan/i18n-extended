import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { i18nExtended } from './i18n-extended';

export { i18nExtended }

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    i18nExtended,
  ],
})
export class i18nExtendedModule { }
