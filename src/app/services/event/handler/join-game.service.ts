import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SYNC_GAME, UPDATE_PLAYER_DATA } from '@consts/channel.const';
import { IPlayerData, ISyncGameData } from '@models/channel.model';
import { EGameStatus } from '@models/game.model';
import { ActionCompletion, ofActionCompleted } from '@ngxs/store';
import { BaseEventHandlerService } from '@services/event/handler/base-handler.srevice';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { Observable, combineLatest, filter, switchMap } from 'rxjs';

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
      switchMap(() => this.ablyService.subscribe<ISyncGameData>(SYNC_GAME)),
      filter(() => this.isPlayerInRoom())
    ).subscribe(data => {
      this.store.dispatch(new GameActions.SyncGame(data));
      this.checkGameStart(data.status, false);
    });
  }

  private updatePlayerStatus(): void {
    this.joinGame$.pipe(
      switchMap(() => combineLatest([
        this.store.select(GameState.roundStatus),
        this.store.select(GameState.status),
      ]))
    ).subscribe(([_, status]) => {
      this.publishPlayerData();

      if (status === EGameStatus.NotInitiated) {
        this.ablyService.unsubscribe();
      }
    });
  }

  private publishPlayerData(): void {
    this.ablyService.publish<IPlayerData>(UPDATE_PLAYER_DATA, this.playerUtil.getPlayerData());
  }

  private isPlayerInRoom(): boolean {
    return this.route.snapshot.queryParamMap.has('roomId');
  }
}
