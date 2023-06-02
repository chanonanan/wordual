import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav>
      <h3>Wordual</h3>
    </nav>
  `,
  styleUrls: ['./navbar.component.less']
})
export class NavbarComponent {

}
