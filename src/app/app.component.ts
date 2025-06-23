import { Component } from '@angular/core';
//import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ApiDisplayComponent } from './components/api-display/api-display.component';
import { QuizComponent } from './components/quiz/quiz.component';
//import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  //imports: [RouterOutlet],
  standalone: true,
  imports: [CommonModule, 
            ApiDisplayComponent, 
            //HttpClientModule,
            QuizComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'mini-project';
}
