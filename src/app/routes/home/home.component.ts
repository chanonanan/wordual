import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { CardComponent } from '@components/card/card.component';
import { KeyboardComponent } from '@components/keyboard/keyboard.component';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameStateModel, GameStateName } from '@stores/game/game.state';
import { UserActions } from '@stores/user/user.action';
import { UserState } from '@stores/user/user.state';
import { BehaviorSubject, Observable, debounceTime } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-home',
  host: {
    class:'main-panel'
  },
  imports: [AsyncPipe, NgIf, AvatarComponent, KeyboardComponent, CardComponent],
  template: `
    <app-card>
      <h3 header>Welcome to Wordual</h3>
      <section content *ngIf="{ username: username$ | async } as data">
        <app-avatar [name]="data.username" />
        <section class="name-section">
          <label for="name">Enter your name:</label>
          <input type="text" name="name" [value]="data.username" (keyup)="updateUsername($event)">
        </section>
      </section>
      <section button *ngIf="{ isUsernameValid: isUsernameValid$ | async } as data" class="button-section">
        <!-- <button (click)="createRoom()" [disabled]="!data.isUsernameValid">Create Room</button> -->
        <button button (click)="roomId ? joinRoom() : createRoom()" [disabled]="!data.isUsernameValid">
          {{ roomId ? 'Join Room' : 'Create Room' }}
        </button>
        <button (click)="findRoom()" [disabled]="!data.isUsernameValid">Find Room</button>
      </section>
    </app-card>
  `,
  styleUrls: ['./home.component.less'],
  standalone: true
})
export class HomeComponent implements OnInit {
  @Input() roomId?: string;
  @Select(UserState.isUsernameValid) isUsernameValid$!: Observable<boolean>;
  @Select(UserState.username) username$!: Observable<string>;

  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private input$ = new BehaviorSubject<string>(this.store.selectSnapshot(UserState.username));

  ngOnInit(): void {
    this.resetGameState();
    this.input$.pipe(
      debounceTime(300),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(input => this.store.dispatch(new UserActions.SetUsername(input)));
  }

  createRoom(): void {
    this.store.dispatch(new GameActions.CreateGame(uuid()));
  }

  joinRoom(): void {
    this.store.dispatch(new GameActions.JoinGame(this.roomId as string));
  }

  findRoom(): void {
    this.store.dispatch(new GameActions.FindGame());
  }

  updateUsername(event: Event): void {
    this.input$.next((event.target as HTMLInputElement).value);
  }

  private resetGameState(): void {
    this.store.reset({
      ...this.store.snapshot(),
      [GameStateName]: {
        ...new GameStateModel()
      }
    });
  }
}
