import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-home',
  template: `
    <section class="home-section">
      <h3>Wordual</h3>
      <section class="button-section">
        <button (click)="createRoom()">Create room</button>
      </section>
    </section>

  `,
  styleUrls: ['./home.component.less'],
  standalone: true
})
export class HomeComponent {
  private router = inject(Router);

  createRoom(): void {
    this.router.navigate(['room', uuid()]);
  }

  joinRoom(): void {
  }
}
