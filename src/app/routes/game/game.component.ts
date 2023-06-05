import { AsyncPipe, NgClass, NgIf } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridComponent } from "@components/grid/grid.component";
import { KeyboardComponent } from "@components/keyboard/keyboard.component";
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game',
    host: {
      class:'main-panel'
    },
    template: `
      <app-grid></app-grid>
      <app-keyboard/>
      <ng-container *ngIf="{
        winner: roundWinner$ | async,
        isHost: isHost$ | async,
      } as data">
        <dialog #dialog [ngClass]="{ 'hide': !data.winner }">
          <p>{{ data.winner }}</p>
          <button *ngIf="data.isHost" (click)="newGame()">New Game</button>
        </dialog>
      </ng-container>
    `,
    styleUrls: ['./game.component.less'],
    standalone: true,
    imports: [KeyboardComponent, GridComponent, NgIf, AsyncPipe, NgClass]
})
export class GameComponent implements AfterViewInit {
  @Input() id?: string;
  @Select(GameState.roundWinner) roundWinner$!: Observable<string>;
  @Select(GameState.isHost) isHost$!: Observable<boolean>;

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;

  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    this.store.select(GameState.roundWinner).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(roundWinner => {
      if (roundWinner) {
        this.dialog.nativeElement.showModal();
      } else {
        this.dialog.nativeElement.close();
      }
    })
  }

  newGame(): void {
    this.store.dispatch(new GameActions.NewGame());
  }
}
