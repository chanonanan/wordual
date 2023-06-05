import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { CardComponent } from '@components/card/card.component';
import { IPlayerData } from '@models/channel.model';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-room',
  host: {
    class:'main-panel'
  },
  imports: [AsyncPipe, AvatarComponent, NgIf, NgFor, CardComponent],
  template: `
    <app-card>
      <h3 header>Waiting Room</h3>
      <div content>
        <section class="player-section" *ngIf="players$ | async as players">
          <app-avatar *ngFor="let player of players" [name]="player.name" [displayName]="true"/>
        </section>
      </div>
      <button button (click)="start()" *ngIf="isHost$ | async">Start</button>
    </app-card>

  `,
  styleUrls: ['./room.component.less'],
  standalone: true
})
export class RoomComponent {
  @Input() id?: string;

  @Select(GameState.players) public players$!: Observable<IPlayerData[]>;
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
