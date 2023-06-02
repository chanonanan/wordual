import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav>
      <h1>Wordual</h1>
    </nav>
  `,
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent {

}
