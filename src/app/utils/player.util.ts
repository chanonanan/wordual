import { Injectable, inject } from '@angular/core';
import { IPlayerData } from '@models/channel.model';
import { Store } from '@ngxs/store';
import { GameState } from '@stores/game/game.state';
import { UserState } from '@stores/user/user.state';

@Injectable({
  providedIn: 'root'
})
export class PlayerUtil {
  private store = inject(Store);

  getPlayerData(): IPlayerData {
    const uuid = this.store.selectSnapshot(UserState.uuid);
    const name = this.store.selectSnapshot(UserState.username);
    const roundStatus = this.store.selectSnapshot(GameState.roundStatus);
    const status = this.store.selectSnapshot(GameState.status);

    return { uuid, name, roundStatus, status };
  }
}
