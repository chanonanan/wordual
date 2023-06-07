import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGear } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FontAwesomeModule],
  template: `
    <nav>
      <h3 (click)="goHome()">Wordual</h3>
      <button><fa-icon [icon]="faGear"/></button>
    </nav>
  `,
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent {
  faGear = faGear;
  private router = inject(Router);

  goHome(): void {
    this.router.navigate(['']);
  }
}
