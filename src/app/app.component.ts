import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TrainListComponent } from './train-list/train-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TrainListComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'train-component-client';
}
