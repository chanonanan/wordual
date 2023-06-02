import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  template: `
    <h1>Worduel!</h1>
    <button (click)="createRoom()">Create room</button>
    <button (click)="joinRoom()">Join room</button>

  `,
  styleUrls: ['./home.component.less'],
  standalone: true
})
export class HomeComponent {
  private router = inject(Router);

  createRoom(): void {
    this.router.navigate(['room', 'asdasd']);
  }

  joinRoom(): void {
  }
}
