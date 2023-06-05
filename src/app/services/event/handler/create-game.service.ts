import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PLAYER_JOIN, REQUEST_ROOM_DATA, REQUEST_USERNAME_VALIDATION, ROOM_DATA_RESULT, SYNC_GAME, USERNAME_VALIDATION_RESULT } from '@consts/channel.const';
import { IPlayerData, IRoomData, ISyncGameData, IUsernameValidation } from '@models/channel.model';
import { ActionCompletion, ofActionCompleted } from '@ngxs/store';
import { BaseEventHandlerService } from '@services/event/handler/base-handler.srevice';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { WordState } from '@stores/word/word.state';
import { Observable, combineLatest, switchMap } from 'rxjs';

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
    this.playerJoin();
    this.gameStateChange();
    this.roomData();
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
      const isValidName = !players.find(player => player.name === newPlayer.name);
      this.ablyService.publish<IUsernameValidation>(USERNAME_VALIDATION_RESULT, { status, isValidName });
    });
  }

  private playerJoin() {
    this.createGame$.pipe(
      switchMap(() => this.ablyService.subscribe<IPlayerData>(PLAYER_JOIN))
    ).subscribe(player => {
      console.log(player.name, ' has joined!');
      this.store.dispatch(new GameActions.AddPlayer(player));
    });
  }

  private gameStateChange() {
    this.createGame$.pipe(
      switchMap(() => combineLatest([
        this.store.select(GameState.players),
        this.store.select(GameState.status),
        this.store.select(WordState.word),
      ]))
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
