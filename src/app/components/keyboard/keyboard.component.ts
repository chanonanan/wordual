import { AsyncPipe, NgClass, NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, inject } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { EMPTY, Observable, delay, first, of, tap } from 'rxjs';
import { TouchDirective } from 'src/app/directives/touch.directive';

@Component({
  selector: 'app-keyboard',
  standalone: true,
  imports: [AsyncPipe, NgClass, NgIf, NgFor, UpperCasePipe, TouchDirective],
  template: `
    <ng-container *ngIf="keyboardStatus$ | async as keyboardStatus">
      <div class="row" *ngFor="let row of rows; trackBy: trackByRow">
        <button class="key"
          *ngFor="let key of row; trackBy: trackByKey"
          appTouch
          (touch)="onKeyTap(key, $event)"
          (click)="onKeyTap(key, $event)"
          [id]="key"
          tabIndex="-1"
          [ngClass]="keyboardStatus(key, specialKeys)">
          {{key | uppercase}}
        </button>
      </div>
    </ng-container>
  `,
  styleUrls: ['./keyboard.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KeyboardComponent {
  @HostListener('document:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (this.store.selectSnapshot(GameState.roundWinner)) {
      return;
    }
    this.onKeyTap(event.key, event);
    this.animateKey(event.key);
  }

  @Select(GameState.keyboardStatus) public keyboardStatus$!: Observable<ReturnType<typeof GameState.keyboardStatus>>;

  public readonly rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '←']
  ];

  public readonly specialKeys = ['enter', '←'];

  private letters = this.rows.flat();

  private store: Store = inject(Store);

  onKeyTap(key: string, event: Event): void {
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

  trackByRow(index: number, row: string[]): string {
    return index.toString();
  }

  trackByKey(index: number, key: string): string {
    return key;
  }

  private animateKey(key: string): void {
    let element = (document.querySelector(`#${key}`) as HTMLButtonElement);

    if (element) {
      of(EMPTY).pipe(
        tap(() => element.focus()),
        tap(() => element.classList.toggle('active')),
        delay(100),
        tap(() => element.classList.toggle('active')),
        first(),
      ).subscribe(() => (element as any) = null);
    }
  }

}
