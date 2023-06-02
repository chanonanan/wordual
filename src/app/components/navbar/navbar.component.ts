import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav>
      <h3 (click)="goHome()">Wordual</h3>
    </nav>
  `,
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent {
  private router = inject(Router)
  goHome(): void {
    this.router.navigate([''])
  }
}
