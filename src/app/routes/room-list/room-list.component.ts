import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AvatarComponent } from '@components/avatar/avatar.component';
import { CardComponent } from '@components/card/card.component';
import { IRoomData } from '@models/channel.model';
import { Select, Store } from '@ngxs/store';
import { GameActions } from '@stores/game/game.action';
import { RoomState } from '@stores/room/room.state';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-room-list',
  host: {
    class:'main-panel'
  },
  standalone: true,
  imports: [CardComponent, NgIf, NgFor, AsyncPipe, AvatarComponent],
  template: `
    <app-card>
      <h3 header>Room List</h3>
      <div content>
        <ul *ngIf="rooms$ | async as rooms">
          <li *ngFor="let room of rooms">
            <app-avatar [name]="room.host.name" [size]="'small'"/>
            <span>{{ room.host }}'s Room</span>
            <span class="join" (click)="joinRoom(room.roomId)">JOIN</span>
          </li>
        </ul>
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
