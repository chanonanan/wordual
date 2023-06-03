import { Component, DestroyRef, Input, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { GAME_STATUS, PLAYER_JOIN, REQUEST_GAME_STATUS, SYNC_GAME } from '@consts/channel.const';
import { IPlayerJoinData, ISyncGameData } from '@models/channel.model';
import { EGameStatus } from '@models/game.model';
import { Actions, Store, ofActionCompleted } from '@ngxs/store';
import { AblyService } from '@services/ably/ably.service';
import { GameActions } from '@stores/game/game.action';
import { GameState } from '@stores/game/game.state';
import { UserState } from '@stores/user/user.state';
import { combineLatest, from, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  template: `
    <app-navbar></app-navbar>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit {
  @Input() id?: string;

  private ablyService = inject(AblyService);
  private actions = inject(Actions);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  private store = inject(Store);

  ngOnInit(): void {
    this.hostEventHandler();
    this.playerEventHandler();
  }

  private hostEventHandler(): void {
    const createGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.CreateGame),
    );

    createGame$.pipe(
      switchMap(({ action: { roomId } }) => from(this.router.navigate(['room', roomId]))),
      switchMap(() => this.ablyService.subscribe<IPlayerJoinData>(REQUEST_GAME_STATUS)),
    ).subscribe(({ player }) => {
      console.log(player, ' has request to join!');

      const status = this.store.selectSnapshot(GameState.status);
      const players = this.store.selectSnapshot(GameState.players);
      this.ablyService.publish(GAME_STATUS, { status, isNameDuplicated: players.includes(player) });
    });

    createGame$.pipe(
      switchMap(() => this.ablyService.subscribe<IPlayerJoinData>(PLAYER_JOIN)),
    ).subscribe(({ player }) => {
      console.log(player, ' has joined!');
      this.store.dispatch(new GameActions.AddPlayer(player));
    });

    createGame$.pipe(
      switchMap(() => combineLatest([
        this.store.select(GameState.players),
        this.store.select(GameState.status),
      ])),
    ).subscribe(([players, status]) => {
      this.ablyService.publish<ISyncGameData>(SYNC_GAME, { players, status });
      this.checkGameStart(status, true);
    });

  }

  private playerEventHandler(): void {
    const joinGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.JoinGame),
    );

    joinGame$.pipe(
      switchMap(({ action: { roomId } }) => from(this.router.navigate(['room', roomId]))),
      tap(() => {
        const player = this.store.selectSnapshot(UserState.username);
        this.ablyService.publish<IPlayerJoinData>(PLAYER_JOIN, { player });
      }),
      switchMap(() => this.ablyService.subscribe<ISyncGameData>(SYNC_GAME)),
    ).subscribe(data => {
      this.store.dispatch(new GameActions.SyncGame(data));
      this.checkGameStart(data.status, false);
    });
  }

  private checkGameStart(status: EGameStatus | undefined, isHost: boolean): void {
    switch (status) {
      case EGameStatus.Started:
        this.router.navigate(['/game', this.id]);
        break;
      case EGameStatus.NotInitiated:
        if (isHost) {
          return;
        }
        alert('Host has left the game!');
        this.router.navigate(['']);
        break;
    }
  }
}
