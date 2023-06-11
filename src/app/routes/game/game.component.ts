import { AsyncPipe, NgClass, NgFor, NgIf } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { GridComponent } from "@components/grid/grid.component";
import { KeyboardComponent } from "@components/keyboard/keyboard.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { WordState } from '@stores/word/word.state';
import { Observable } from 'rxjs';

@Component({
    selector: 'app-game',
    host: {
      class:'main-panel'
    },
    template: `
      <app-grid></app-grid>
      <ng-container *ngIf="{
        winner: roundWinner$ | async,
        isHost: isHost$ | async,
        answer: answer$ | async,
        definitions: definitions$ | async
      } as data">
        <button class="new-game-btn hide" #btn *ngIf="data.isHost && data.winner" (click)="newGame()">New Game</button>
        <dialog #dialog class="hide">
          <section class="header">
            <p>{{ data.winner }}</p>
            <fa-icon [icon]="faXmark" (click)="closeModal()"/>
          </section>
          <section class="answer">
            <span>Answer's <b>{{ data.answer }}</b></span>
          </section>
          <section class="definitions">
            <p>Definitions:</p>
            <ul>
              <li *ngFor="let definitions of data.definitions">{{ definitions }}</li>
            </ul>
          </section>
          <section class="button">
            <button *ngIf="data.isHost" (click)="newGame()">New Game</button>
          </section>
        </dialog>
      </ng-container>
      <app-keyboard/>
    `,
    styleUrls: ['./game.component.less'],
    standalone: true,
    imports: [KeyboardComponent, GridComponent, NgIf, AsyncPipe, NgClass, NgFor, FontAwesomeModule]
})
export class GameComponent implements AfterViewInit {
  @Input() id?: string;
  @Select(GameState.roundWinner) roundWinner$!: Observable<string>;
  @Select(GameState.isHost) isHost$!: Observable<boolean>;
  @Select(WordState.word) answer$!: Observable<string>;
  @Select(WordState.definitions) definitions$!: Observable<string[]>;

  @ViewChild('dialog') dialog!: ElementRef<HTMLDialogElement>;
  @ViewChild('btn') btn!: ElementRef<HTMLButtonElement>;

  faXmark = faXmark;

  private store = inject(Store);
  private destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    this.store.select(GameState.roundWinner).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(roundWinner => {
      if (roundWinner) {
        this.dialog.nativeElement.showModal();
        this.dialog.nativeElement.classList.remove('hide');
      } else {
        this.dialog.nativeElement.close();
        this.dialog.nativeElement.classList.add('hide');
        this.btn.nativeElement.classList.remove('hide');
      }
    })
  }

  closeModal(): void {
    this.dialog.nativeElement.close();
    this.dialog.nativeElement.classList.add('hide');
    this.btn.nativeElement.classList.remove('hide');
  }

  newGame(): void {
    this.store.dispatch(new GameActions.NewGame());
  }
}
