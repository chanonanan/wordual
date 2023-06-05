import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PLAYER_JOIN, SYNC_GAME } from '@consts/channel.const';
import { IPlayerData, ISyncGameData } from '@models/channel.model';
import { ActionCompletion, ofActionCompleted } from '@ngxs/store';
import { BaseEventHandlerService } from '@services/event/handler/base-handler.srevice';
import { GameActions } from '@stores/game/game.action';
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
    this.syncGame();
  }

  private syncGame(): void {
    this.joinGame$.pipe(
      switchMap(() => this.ablyService.subscribe<ISyncGameData>(SYNC_GAME))
    ).subscribe(data => {
      this.store.dispatch(new GameActions.SyncGame(data));
      this.checkGameStart(data.status, false);
    });
  }

  private afterNavigation() {
    this.joinGame$.pipe(
      this.afterNavigatedEnd<GameActions.JoinGame>('room'),
    ).subscribe(() => {
      this.ablyService.publish<IPlayerData>(PLAYER_JOIN, this.playerUtil.getPlayerData());
    });
  }
}
