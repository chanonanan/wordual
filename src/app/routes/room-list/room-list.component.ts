import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CardComponent } from '@components/card/card.component';
import { IRoomData } from '@models/channel.model';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { RoomState } from '@stores/room/room.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CardComponent, NgIf, NgFor, AsyncPipe],
  template: `
    <app-card>
      <h3 header>Room List</h3>
      <div content>
        <section class="rooms-section" *ngIf="rooms$ | async as rooms">
          <div class="room-item" *ngFor="let room of rooms">
            <span>{{ room.host }}'s Room</span>
            <button (click)="joinRoom(room.roomId)">Join</button>
          </div>
        </section>
      </div>
    </app-card>
  `,
  styleUrls: ['./room-list.component.less']
})
export class RoomListComponent {
  @Select(RoomState.rooms) public rooms$!: Observable<IRoomData[]>;

  private store = inject(Store);

  joinRoom(roomId: string): void {
    this.store.dispatch(new GameActions.JoinGame(roomId));
  }
}
