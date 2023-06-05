import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { REQUEST_ROOM_DATA, REQUEST_USERNAME_VALIDATION, ROOM_DATA_RESULT, SYNC_GAME, UPDATE_PLAYER_DATA, USERNAME_VALIDATION_RESULT } from '@consts/channel.const';
import { IPlayerData, IRoomData, ISyncGameData, IUsernameValidation } from '@models/channel.model';
import { ActionCompletion, ofActionCompleted } from '@ngxs/store';
import { BaseEventHandlerService } from '@services/event/handler/base-handler.srevice';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { WordState } from '@stores/word/word.state';
import { Observable, combineLatest, debounceTime, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreateGameEventHandlerService extends BaseEventHandlerService {

  private createGame$!: Observable<ActionCompletion<GameActions.CreateGame, Error>>
  protected override init() {
    this.createGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.CreateGame)
    );

    this.afterNavigation();
    this.usernameValidation();
    this.playersData();
    this.gameStateChange();
    this.roomData();
    this.playersData();
  }

  private afterNavigation() {
    this.createGame$.pipe(
      this.afterNavigatedEnd<GameActions.CreateGame>('room'),
    ).subscribe(() => {
      this.boardcastRoomData()
    });
  }

  private usernameValidation(): void {
    this.createGame$.pipe(
      switchMap(() => this.ablyService.subscribe<IPlayerData>(REQUEST_USERNAME_VALIDATION))
    ).subscribe(newPlayer => {
      console.log(newPlayer.name, ' has request to join!');
      const status = this.store.selectSnapshot(GameState.status);
      const players = this.store.selectSnapshot(GameState.players);
      const isValidName = !players.find(player => player.name === newPlayer.name && player.uuid !== player.uuid);
      this.ablyService.publish<IUsernameValidation>(USERNAME_VALIDATION_RESULT, { status, isValidName });
    });
  }

  private playersData() {
    this.createGame$.pipe(
      switchMap(() => this.ablyService.subscribe<IPlayerData>(UPDATE_PLAYER_DATA))
    ).subscribe(player => {
      console.log(player.name, ' has sync!');
      this.store.dispatch(new GameActions.SyncPlayer(player));
    });
  }

  private gameStateChange() {
    this.createGame$.pipe(
      switchMap(() => combineLatest([
        this.store.select(GameState.players),
        this.store.select(GameState.status),
        this.store.select(WordState.word),
      ]).pipe(debounceTime(300)))
    ).subscribe(([players, status, answer]) => {
      this.ablyService.publish<ISyncGameData>(SYNC_GAME, { players, status, answer });
      this.boardcastRoomData();
      this.checkGameStart(status, true);
    });
  }

  private roomData() {
    this.createGame$.pipe(
      switchMap(() => this.ablyService.subscribeRoom<IPlayerData>(REQUEST_ROOM_DATA))
    ).subscribe(({ name }) => {
      console.log(name, ' has request room data!');
      this.boardcastRoomData();
    });
  }

  private boardcastRoomData(): void {
    this.ablyService.publishRoom<IRoomData>(ROOM_DATA_RESULT, this.roomUtil.getRoomData());
  }

}
