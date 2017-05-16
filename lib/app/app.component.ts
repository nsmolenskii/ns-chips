import {Component} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  second = 'Two';
  values = [1, 3];
  disabled = false;
  required = false;
}
