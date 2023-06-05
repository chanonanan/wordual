import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SYNC_GAME, UPDATE_PLAYER_DATA } from '@consts/channel.const';
import { IPlayerData, ISyncGameData } from '@models/channel.model';
import { ActionCompletion, ofActionCompleted } from '@ngxs/store';
import { BaseEventHandlerService } from '@services/event/handler/base-handler.srevice';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { Observable, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JoinGameEventHandlerService extends BaseEventHandlerService {

  private joinGame$!: Observable<ActionCompletion<GameActions.JoinGame, Error>>
  protected override init() {
    this.joinGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.JoinGame)
    );

    this.afterNavigation();
    this.syncGameFromHost();
    this.updatePlayerStatus();
  }

  private afterNavigation() {
    this.joinGame$.pipe(
      this.afterNavigatedEnd<GameActions.JoinGame>('room'),
    ).subscribe(() => {
      this.publishPlayerData();
    });
  }

  private syncGameFromHost(): void {
    this.joinGame$.pipe(
      switchMap(() => this.ablyService.subscribe<ISyncGameData>(SYNC_GAME))
    ).subscribe(data => {
      this.store.dispatch(new GameActions.SyncGame(data));
      this.checkGameStart(data.status, false);
    });
  }

  private updatePlayerStatus(): void {
    this.joinGame$.pipe(
      switchMap(() => this.store.select(GameState.roundStatus))
    ).subscribe(() => {
      this.publishPlayerData();
    });
  }

  private publishPlayerData(): void {
    this.ablyService.publish<IPlayerData>(UPDATE_PLAYER_DATA, this.playerUtil.getPlayerData());
  }
}
