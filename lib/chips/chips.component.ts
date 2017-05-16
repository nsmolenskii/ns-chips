import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren
} from '@angular/core';
import {ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR} from '@angular/forms';
import {BACKSPACE, DELETE, ESCAPE, LEFT_ARROW, MdChip, MdInputDirective, RIGHT_ARROW} from '@angular/material';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/debounceTime';


export interface NsOption {
  value: any;
  viewValue: string;
}

export const TD_CHIPS_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ChipsComponent),
  multi: true,
};

@Component({
  selector: 'ns-chip-option',
  template: '<ng-content></ng-content>'
})
export class ChipOptionComponent implements NsOption {

  @Input() value: any;

  get viewValue() {
    return this.element.nativeElement.innerHTML;
  }

  constructor(private element: ElementRef) {
  }

}

@Component({
  providers: [TD_CHIPS_CONTROL_VALUE_ACCESSOR],
  selector: 'ns-chips',
  styleUrls: ['./chips.component.scss'],
  templateUrl: './chips.component.html',
})
export class ChipsComponent implements OnInit, AfterContentInit, ControlValueAccessor {

  private _valuesChange = new EventEmitter<any[]>(true);
  private _touchChange = new EventEmitter<any>(true);

  private _required: boolean = false;
  private _disabled: boolean = false;

  @ViewChild(MdInputDirective) _inputChild: MdInputDirective;
  @ViewChildren(MdChip) _chipsChildren: QueryList<MdChip>;
  @ContentChildren(ChipOptionComponent) _chipOptionsChildren: QueryList<ChipOptionComponent>;

  selectedOptions: NsOption[] = [];
  filteredOptions: NsOption[] = [];
  availableOptions: NsOption[] = [];

  matches: boolean = true;
  focused: boolean = false;
  touched: boolean = false;
  inputControl: FormControl = new FormControl();

  @Output('add') add: EventEmitter<any> = new EventEmitter<any>();
  @Output('remove') remove: EventEmitter<any> = new EventEmitter<any>();
  @Output('valueChange') valueChange: EventEmitter<any> = new EventEmitter<any>();


  @Input('disabled')
  set disabled(disabled: boolean) {
    this._disabled = <any> disabled === '' || disabled;
    if (this.disabled) {
      this.inputControl.disable()
    } else {
      this.inputControl.enable();
    }
  }

  get disabled(): boolean {
    return this._disabled;
  }

  @Input('required')
  set required(required: boolean) {
    this._required = <any> required === '' || required;
  }

  get required(): boolean {
    return this._required;
  }

  @Input('placeholder') placeholder: string;

  @Input()
  get value(): any[] {
    return this.selectedOptions.map(option => option.value);
  }

  set value(values: any[]) {
    if (this.availableOptions) {
      values = values || [];
      const reduce = this.availableOptions.reduce((agg, item) => Object.assign({}, agg, {[item.value]: item}), {});
      this.selectedOptions = values.map(value => reduce[value]).filter(value => !!value);
      this._filterOptions(this.inputControl.value);
    }
  }

  writeValue(value) {
    this.value = value;
  }

  registerOnChange(fn) {
    this._valuesChange.subscribe(fn);
  }

  registerOnTouched(fn) {
    this._touchChange.subscribe(fn);
  }

  setDisabledState(disabled: boolean) {
    this.disabled = disabled;
  }

  ngAfterContentInit(): void {
    this._chipOptionsChildren.changes.startWith(null)
      .subscribe(() => {
        this.availableOptions = this._chipOptionsChildren.toArray()
      });
  }

  ngOnInit(): void {
    this.inputControl.valueChanges
      .debounceTime(100)
      .subscribe((value: string) => {
        this.matches = true;
        this._filterOptions(value);
      });
    // filter the autocomplete options after everything is rendered
    Observable.timer().subscribe(() => {
      this._filterOptions(this.inputControl.value);
    });
  }

  addChip(value: any): boolean {
    const option = this.availableOptions.find(option => option.value == value);
    if (!option || this.selectedOptions.indexOf(option) > -1) {
      this.matches = false;
      return false;
    }
    this.selectedOptions.push(option);
    this.add.emit(option.value);
    this._valuesChange.next(this.value);
    this.inputControl.setValue('');
    this.matches = true;
    return true;
  }

  removeChip(value: any): boolean {
    const option = this.availableOptions.find(option => option.value == value);
    const index = this.selectedOptions.indexOf(option);
    if (index < 0) {
      return false;
    }
    this.selectedOptions.splice(index, 1);
    this.remove.emit(option.value);
    this._valuesChange.next(this.value);
    this.inputControl.setValue('');
    return true;
  }

  focusInput(): void {
    if (!this.disabled) {
      this._inputChild.focus();
    }
  }


  onInputFocus(): boolean {
    this.focused = true;
    this.touched = true;
    this._touchChange.emit();
    return true;
  }

  onInputBlur(): boolean {
    this.focused = false;
    this.matches = true;
    this.touched = true;
    this._touchChange.emit();
    return true;
  }

  onInputKeyDown(event: KeyboardEvent): void {
    switch (event.keyCode) {
      case LEFT_ARROW:
      case DELETE:
      case BACKSPACE:
        if (!this._inputChild.value) {
          this._focusLastChip();
          event.preventDefault();
        }
        break;
      case RIGHT_ARROW:
        if (!this._inputChild.value) {
          this._focusFirstChip();
          event.preventDefault();
        }
        break;
    }
  }

  onChipKeyDown(event: KeyboardEvent, index: number, value: any): void {
    switch (event.keyCode) {
      case DELETE:
      case BACKSPACE:
        if (!this.disabled) {
          if (index === (this._totalChips - 1) && index === 0) {
            this.focusInput();
          } else if (index < (this._totalChips - 1)) {
            this._focusChip(index + 1);
          }
          this.removeChip(value);
        }
        break;
      case LEFT_ARROW:
        if (index === 0 && !this.disabled) {
          this.focusInput();
          event.stopPropagation();
        }
        break;
      case RIGHT_ARROW:
        if (index === (this._totalChips - 1) && !this.disabled) {
          this.focusInput();
          event.stopPropagation();
        }
        break;
      case ESCAPE:
        this.focusInput();
        break;
    }
  }

  get invalid() {
    return !this.matches || (this.touched && this.required && !this.selectedOptions.length)
  }

  private _filterOptions(value: string): void {
    this.filteredOptions = this.availableOptions
      .filter((option: NsOption) => {
        return value ? new RegExp(`${value}`, 'gi').test(option.viewValue) : true;
      })
      .filter((option: NsOption) => {
        return this.selectedOptions.indexOf(option) < 0;
      });
  }

  private get _totalChips(): number {
    return this._chipsChildren.toArray().length;
  }

  private _focusChip(index: number): void {
    if (index > -1 && this._totalChips > index) {
      this._chipsChildren.toArray()[index].focus();
    }
  }

  private _focusFirstChip(): void {
    this._focusChip(0);
  }

  private _focusLastChip(): void {
    this._focusChip(this._totalChips - 1);
  }
}
