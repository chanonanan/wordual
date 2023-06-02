import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
export class GameComponent implements OnInit {
  id!: string;
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id') || '';
  }

}
