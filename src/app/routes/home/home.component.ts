import { AsyncPipe, NgIf } from '@angular/common';
import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameStateModel, GameStateName } from '@stores/game/game.state';
import { UserActions } from '@stores/user/user.action';
import { UserState } from '@stores/user/user.state';
import { BehaviorSubject, Observable, debounceTime } from 'rxjs';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, NgIf, AvatarComponent],
  template: `
    <section class="home-section">
      <h3>Welcome to Wordual</h3>
      <app-avatar [name]="username$ | async" />
      <section class="name-section section">
        <label for="name">Enter your name:</label>
        <input type="text" name="name" (keyup)="updateUsername($event)">
      </section>
      <section class="button-section section"*ngIf="{ isUsernameValid: isUsernameValid$ | async} as data" >
        <button (click)="createRoom()" *ngIf="!room; else joinRoomTemplate" [disabled]="!data.isUsernameValid">Create room</button>
        <ng-template #joinRoomTemplate>
          <button (click)="joinRoom()" [disabled]="!data.isUsernameValid">Join room</button>
        </ng-template>
      </section>
    </section>

  `,
  styleUrls: ['./home.component.less'],
  standalone: true
})
export class HomeComponent implements OnInit {
  @Input() room?: string;
  @Select(UserState.isUsernameValid) isUsernameValid$!: Observable<boolean>;
  @Select(UserState.username) username$!: Observable<string>;

  private store = inject(Store);
  private destroyRef = inject(DestroyRef);
  private input$ = new BehaviorSubject<string>('');

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
    this.store.dispatch(new GameActions.JoinGame(this.room as string));
  }

  updateUsername(event: Event): void {
    this.input$.next((event.target as HTMLInputElement).value);
  }

  private resetGameState(): void {
    this.store.reset({
      [GameStateName]: {
        ...new GameStateModel()
      }
    });
  }
}
