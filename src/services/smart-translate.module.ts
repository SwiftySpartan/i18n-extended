import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SmartTranslate } from './smart-translate';

export { SmartTranslate }

@NgModule({
  imports: [
    CommonModule,
  ],
  providers: [
    SmartTranslate,
  ],
})
export class SmartTranslateModule { }
