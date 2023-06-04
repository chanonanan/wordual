import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { CardComponent } from '@components/card/card.component';
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
        <section class="player-section" *ngIf="player$ | async as players">
          <div class="player" *ngFor="let player of players">
            <app-avatar [name]="player"/>
            <span>{{ player }}</span>
          </div>
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
