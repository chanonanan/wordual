import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-room',
  imports: [AsyncPipe, AvatarComponent, NgIf, NgFor],
  template: `
    <section class="link-section">
      <input [value]="url" readonly>
      <button (click)="copy()">Copy</button>
    </section>
    <section class="player-section" *ngIf="player$ | async as players">
      <div class="player" *ngFor="let player of players">
        <app-avatar [name]="player"/>
        <span>{{ player }}</span>
      </div>
    </section>
    <section class="start-section" *ngIf="isHost$ | async">
      <button (click)="start()">Start</button>
    </section>

  `,
  styleUrls: ['./room.component.less'],
  standalone: true
})
export class RoomComponent {
  @Input() id?: string;

  @Select(GameState.players) public player$!: Observable<string>;
  @Select(GameState.isHost) public isHost$!: Observable<boolean>;

  get url(): string {
    return location.href;
  }

  private store = inject(Store);

  start(): void {
    this.store.dispatch(new GameActions.StartGame());
  }

  copy(): void {
    navigator.clipboard.writeText(this.url).then(() => console.log('Copied!'));
  }

}
