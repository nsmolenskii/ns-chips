import {NgModule} from '@angular/core';
import {ChipsComponent, ChipOptionComponent} from './chips.component';
import {MaterialModule, MdAutocompleteModule, MdChipsModule, MdIconModule, MdInputModule, MdOptionModule} from '@angular/material';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';


@NgModule({
  declarations: [
    ChipsComponent,
    ChipOptionComponent,
  ],
  exports: [
    ChipsComponent,
    ChipOptionComponent,
    MdOptionModule,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MdAutocompleteModule,
    MdChipsModule,
    MdIconModule,
    MdInputModule,

  ]
})
export class ChipsModule {
}
