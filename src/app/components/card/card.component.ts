import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="header">
      <ng-content select="[header]"></ng-content>
    </section>
    <ng-content select="[content]"></ng-content>
    <section class="button">
      <ng-content select="[button]"></ng-content>
    </section>
  `,
  styleUrls: ['./card.component.less'],
  encapsulation: ViewEncapsulation.Emulated
})
export class CardComponent {

}
