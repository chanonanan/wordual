import { AsyncPipe, NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [AsyncPipe, NgClass, NgIf, NgFor, UpperCasePipe],
  template: `
    <ng-container *ngIf="wordUsed$ | async as wordUsed">
      <div class="row" *ngFor="let row of rows">
        <div class="key" *ngFor="let key of row" (click)="onKeyTap(key)"
        [ngClass]="{'found': wordUsed.has(key) && wordUsed.get(key), 'not-found': wordUsed.has(key) && !wordUsed.get(key)}">
          {{key | uppercase}}
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ['./keyboard.component.less']
})
export class KeyboardComponent {
  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    this.onKeyTap(event.key);
  }

  @Select(GameState.wordUsed) public wordUsed$!: Observable<Map<string, boolean>>;

  public readonly rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '←']
  ];

  private letters = this.rows.flat();

  private store: Store = inject(Store);

  onKeyTap(key: string): void {
    console.log(key);
    switch (key.toLowerCase()) {
      case 'enter':
        this.store.dispatch(new GameActions.EnterWord());
        break;
      case '←':
      case 'backspace':
        this.store.dispatch(new GameActions.RemoveCharacter());
        break;
      default:
        if (!this.letters.includes(key.toLowerCase())) {
          break;
        }
        this.store.dispatch(new GameActions.AddCharacter(key));
        break;
    }
  }

}
