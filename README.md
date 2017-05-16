# @ns/chips

Provides [@angular/material] composition-component for [chips] with [autocomplete]. 

## [Live Demo]

## Usage

### Import module

```typescript
//app.module.ts
import {ChipsModule} from '@ns/ships';

@NgModule({
 imports: [
   ChipsModule,
   ...
 ],
 ...
})
export class AppModule {}
```

### Component usage
```html
<!--app.component.html-->
<ns-chips placeholder="Options" [(ngModel)]="selectedOptions" required>
  <ns-chip-option *ngFor="let option of availableOptions" [value]="option.value">{{option.name}}</ns-chip-option>
</ns-chips>
```

```typescript
//app.component.ts
@Component({
  ...
})
class AppComponent {
  availableOptions = [{value: 1, name: 'One'}, {value: 2, name: 'Two'}];
}
```

### Theming
```scss
//styles.scss
@import '~@angular/material/theming';
@import '~@ns/chips/lib/theming';

@include mat-core();

$primary: mat-palette($mat-indigo);
$accent: mat-palette($mat-orange);
$warning: mat-palette($mat-red);

$theme: mat-light-theme($primary, $accent, $warning);

@include angular-material-theme($theme);
@include ns-chips-theme($theme);

```

[Live Demo]: https://nsmolenskii.github.io/ns-chips/
[@angular/material]: https://material.angular.io
[chips]: https://material.angular.io/components/component/chips
[autocomplete]: https://material.angular.io/components/component/autocomplete
