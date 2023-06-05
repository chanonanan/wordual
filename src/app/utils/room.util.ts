import { Injectable, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IRoomData } from '@models/channel.model';
import { Store } from '@ngxs/store';
import { GameState } from '@stores/game/game.state';
import { PlayerUtil } from '@utils/player.util';

@Injectable({
  providedIn: 'root'
})
export class RoomUtil {
  private store = inject(Store);
  private route = inject(ActivatedRoute);
  private playerUtil = inject(PlayerUtil);

  getRoomData(): IRoomData {
    const status = this.store.selectSnapshot(GameState.status);
    const players = this.store.selectSnapshot(GameState.players);
    const host = this.playerUtil.getPlayerData();
    const roomId = this.route.snapshot.queryParamMap.get('roomId') as string;

    return { status, players, host, roomId };
  }
}
