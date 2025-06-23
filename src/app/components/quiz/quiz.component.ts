import { Component } from '@angular/core';
import { CommonModule} from '@angular/common';
import { FormsModule } from '@angular/forms';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent {
  questions: QuizQuestion[] = [
    {
      question: 'What is the global average gender pay gap?',
      options: ['16%', '8%', '25%', '5%'],
      correctAnswerIndex: 0
    },
    {
      question: 'What percentage of parliamentarians are women globally?',
      options: ['12%', '27%', '40%', '50%'],
      correctAnswerIndex: 1
    },
    {
      question: 'Which sector shows the largest gender gap?',
      options: ['Politics', 'Education', 'Technology', 'Healthcare'],
      correctAnswerIndex: 0
    },
    {
      question: 'What percentage of Fortune 500 CEOs are women?',
      options: ['8%', '15%', '22%', '30%'],
      correctAnswerIndex: 0
    },
    {
      question: 'Which country was the first to grant women the right to vote?',
      options: ['United States', 'United Kingdom', 'New Zealand', 'Australia'],
      correctAnswerIndex: 2
    }
  ];

  currentIndex = 0;
  selectedAnswer: number | null = null;
  score = 0;
  quizFinished = false;
  showAnswer = false;
  answerWasCorrect: boolean | null = null;

  get currentQuestion() {
    return this.questions[this.currentIndex];
  }

  submitAnswer() {
    if (this.selectedAnswer === null) return;
    this.answerWasCorrect = this.selectedAnswer === this.currentQuestion.correctAnswerIndex;
    if (this.answerWasCorrect) {
      this.score++;
    }
    this.showAnswer = true;
  }

  nextQuestion() {
    this.selectedAnswer = null;
    this.showAnswer = false;
    this.answerWasCorrect = null;
    this.currentIndex++;
    if(this.currentIndex >= this.questions.length) {
      this.quizFinished = true;
    }
  }
}
