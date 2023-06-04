import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { PLAYER_JOIN, REQUEST_ROOM_DATA, REQUEST_USERNAME_VALIDATION, ROOM_DATA_RESULT, SYNC_GAME, USERNAME_VALIDATION_RESULT } from '@consts/channel.const';
import { IPlayerJoinData, IRoomData, ISyncGameData, IUsernameValidation } from '@models/channel.model';
import { EGameStatus } from '@models/game.model';
import { ActionCompletion, Actions, Store, ofActionCompleted } from '@ngxs/store';
import { AblyService } from '@services/ably/ably.service';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { RoomActions } from '@stores/room/room.action';
import { UserState } from '@stores/user/user.state';
import { WordState } from '@stores/word/word.state';
import { Observable, OperatorFunction, combineLatest, filter, from, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  private ablyService = inject(AblyService);
  private actions = inject(Actions);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private store = inject(Store);

  ngOnInit(): void {
    this.createGameEventHandler();
    this.joinGameEventHandler();
    this.findGameEventHandler();
  }

  private createGameEventHandler(): void {
    const createGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.CreateGame)
    );

    // Subscribe to username validation requests
    createGame$.pipe(
      this.afterNavigatedEnd<GameActions.CreateGame>('room'),
      tap(() => this.boardcastRoomData()),
      switchMap(() => this.ablyService.subscribe<IPlayerJoinData>(REQUEST_USERNAME_VALIDATION))
    ).subscribe(({ player }) => {
      console.log(player, ' has request to join!');
      this.handleUsernameValidation(player);
    });

    // Subscribe to player join events
    createGame$.pipe(
      switchMap(() => this.ablyService.subscribe<IPlayerJoinData>(PLAYER_JOIN))
    ).subscribe(({ player }) => {
      console.log(player, ' has joined!');
      this.addPlayerToGame(player);
    });

    // Subscribe to game state changes
    createGame$.pipe(
      switchMap(() => combineLatest([
        this.store.select(GameState.players),
        this.store.select(GameState.status),
        this.store.select(WordState.word),
      ]))
    ).subscribe(([players, status, answer]) => {
      this.syncGameToOthers({ players, status, answer });
      this.boardcastRoomData();
      this.checkGameStart(status, true);
    });

    // Subscribe to room list events
    createGame$.pipe(
      switchMap(() => this.ablyService.subscribeRoom<IPlayerJoinData>(REQUEST_ROOM_DATA))
    ).subscribe(({ player }) => {
      console.log(player, ' has request room data!');
      this.boardcastRoomData();
    });
  }

  private joinGameEventHandler(): void {
    const joinGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.JoinGame)
    );

    // Subscribe to join game events
    joinGame$.pipe(
      this.afterNavigatedEnd<GameActions.JoinGame>('room'),
      tap(() => this.publishPlayerJoinData()),
      switchMap(() => this.ablyService.subscribe<ISyncGameData>(SYNC_GAME))
    ).subscribe(data => {
      this.syncGame(data);
      this.checkGameStart(data.status, false);
    });
  }

  private findGameEventHandler(): void {
    const findGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.FindGame)
    );

    findGame$.pipe(
      this.afterNavigatedEnd<GameActions.FindGame>('room-list'),
      tap(() => this.publishPlayerFindData()),
      switchMap(() => this.ablyService.subscribeRoom<IRoomData>(ROOM_DATA_RESULT))
    ).subscribe(data => {
      this.store.dispatch(new RoomActions.SetRoomData(data));
    });
  }

  //#region Host events
  private handleUsernameValidation(player: string): void {
    const status = this.store.selectSnapshot(GameState.status);
    const players = this.store.selectSnapshot(GameState.players);
    this.ablyService.publish<IUsernameValidation>(USERNAME_VALIDATION_RESULT, { status, isValid: !players.includes(player) });
  }

  private addPlayerToGame(player: string): void {
    this.store.dispatch(new GameActions.AddPlayer(player));
  }

  private syncGameToOthers(data: ISyncGameData): void {
    this.ablyService.publish<ISyncGameData>(SYNC_GAME, data);
  }

  private boardcastRoomData(): void {
    const status = this.store.selectSnapshot(GameState.status);
    const players = this.store.selectSnapshot(GameState.players);
    const host = this.store.selectSnapshot(UserState.username);
    const hostId = this.store.selectSnapshot(UserState.uuid);
    const roomId = this.route.snapshot.queryParamMap.get('roomId') as string;
    this.ablyService.publishRoom<IRoomData>(ROOM_DATA_RESULT, {
      host,
      hostId,
      status,
      players,
      roomId,
    });
  }
  //#endregion

  //#region Player events
  private publishPlayerJoinData(): void {
    const player = this.store.selectSnapshot(UserState.username);
    this.ablyService.publish<IPlayerJoinData>(PLAYER_JOIN, { player });
  }

  private publishPlayerFindData(): void {
    const player = this.store.selectSnapshot(UserState.username);
    this.ablyService.publishRoom<IPlayerJoinData>(REQUEST_ROOM_DATA, { player });
  }

  private syncGame(data: ISyncGameData): void {
    this.store.dispatch(new GameActions.SyncGame(data));
  }
  //#endregion

  private checkGameStart(status: EGameStatus | undefined, isHost: boolean): void {
    switch (status) {
      case EGameStatus.Started:
        const roomId = this.route.snapshot.queryParamMap.get('roomId');
        this.router.navigate(['game'], {
          queryParams: { roomId, isAuthenicated: true }
        });
        break;
      case EGameStatus.NotInitiated:
        if (isHost) {
          return;
        }
        alert('Host has left the game!');
        this.ablyService.unsubscribe();
        this.router.navigate(['']);
        break;
    }
  }

  private afterNavigatedEnd<T = GameActions.CreateGame | GameActions.JoinGame | GameActions.FindGame>(
    page: string
  ): OperatorFunction<ActionCompletion<T, Error>, boolean> {
    return (source: Observable<ActionCompletion<T, Error>>): Observable<boolean> => {
        return source.pipe(
          switchMap(({ action }) => from(this.router.navigate([page], {
            ...((action as GameActions.JoinGame).roomId ? {
              queryParams: { roomId: (action as GameActions.JoinGame).roomId }
            } : {}),
          })).pipe(
            filter(Boolean)
          )),
        )
    };
  }
}
