import { Component, Input } from '@angular/core';
import { GridComponent } from "@components/grid/grid.component";
import { KeyboardComponent } from "@components/keyboard/keyboard.component";

@Component({
    selector: 'app-game',
    template: `
    <app-grid></app-grid>
    <app-keyboard></app-keyboard>
  `,
    styleUrls: ['./game.component.less'],
    standalone: true,
    imports: [KeyboardComponent, GridComponent]
})
export class GameComponent {
  @Input() id?: string;
}
