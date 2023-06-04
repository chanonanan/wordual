import { Injectable, NgZone, inject } from '@angular/core';
import { Router } from '@angular/router';
import { EGameStatus } from '@models/game.model';
import { EGridStatus, IGridData } from '@models/grid.model';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { append, patch, removeItem } from '@ngxs/store/operators';
import { AblyService } from '@services/ably/ably.service';
import { UserState } from '@stores/user/user.state';
import { map, tap } from 'rxjs';
import { GameActions } from './game.action';

export class GameStateModel {
  public answer: string = 'chano';
  public word: string[] = [];
  public histories: IGridData[][] = [];
  public isHost: boolean = false;
  public players: string[] = [];
  public status: EGameStatus = EGameStatus.NotInitiated;
};

export const GameStateName = 'GameState';

@State<GameStateModel>({
  name: GameStateName,
  defaults: new GameStateModel(),
})
@Injectable()
export class GameState {
  private store = inject(Store);
  private router = inject(Router);
  private ablyService = inject(AblyService);
  private ngZone = inject(NgZone);

  @Selector()
  public static word(state: GameStateModel): string[] {
    return state.word;
  }

  @Selector()
  public static histories(state: GameStateModel): IGridData[][] {
    return state.histories;
  }

  @Selector()
  public static isHost(state: GameStateModel): boolean {
    return state.isHost;
  }

  @Selector()
  public static players(state: GameStateModel): string[] {
    return state.players;
  }

  @Selector()
  public static status(state: GameStateModel): EGameStatus {
    return state.status;
  }

  @Selector([GameState.histories])
  public static wordUsed(state: GameStateModel, histories: IGridData[][]): Map<string, boolean> {
    const flattenedHistories = histories.flat();
    return flattenedHistories.reduce((result: Map<string, boolean>, data: IGridData) => {
      if (!result.get(data.letter)) {
        result.set(data.letter, data.status !== EGridStatus.NOT_IN_WORD);
      }

      return result;
    }, new Map<string, boolean>());
  }

  @Selector([GameState.word, GameState.histories])
  public static gridData(state: GameStateModel, word: string[], histories: IGridData[][]): IGridData[][] {
    const emptyWord = Array.from({ length: 5 }, () => ({
      letter: '',
      status: EGridStatus.EMPTY
    }));

    const historiesWithCurrent = [
      ...histories,
      Array.from({ length: 5 }, (_, index) => ({
        letter: word[index] || '',
        status: EGridStatus.EMPTY
      }))
    ]

    return Array.from({ length: 6 }, (_, index) => historiesWithCurrent[index] || emptyWord);
  }

  @Action(GameActions.AddCharacter)
  addCharacter(
    ctx: StateContext<GameStateModel>,
    { character }: GameActions.AddCharacter,
  ) {

    const { word } = ctx.getState();
    if (word.length === 5) {
      return;
    }

    ctx.setState(
      patch<GameStateModel>({
        word: append<string>([character])
      })
    );
  }

  @Action(GameActions.RemoveCharacter)
  removeCharacter(
    ctx: StateContext<GameStateModel>,
  ) {

    ctx.setState(
      patch<GameStateModel>({
        word: removeItem<string>(ctx.getState().word.length - 1)
      })
    );
  }

  @Action(GameActions.EnterWord)
  enterWord(
    ctx: StateContext<GameStateModel>,
  ) {

    const { word, answer } = ctx.getState();
    if (word.length < 5) {
      return;
    }

    ctx.setState(
      patch<GameStateModel>({
        histories: append<IGridData[]>([
          word.map((letter, index) => ({
            letter,
            status: !answer.includes(letter) ? EGridStatus.NOT_IN_WORD :
              (answer[index] === letter ? EGridStatus.RIGHT_POSITION : EGridStatus.WRONG_POSITION)
          }))
        ]),
        word: [],
      })
    );
  }

  @Action(GameActions.CreateGame)
  createGame(
    ctx: StateContext<GameStateModel>,
    { roomId }: GameActions.CreateGame
  ) {

    const username = this.store.selectSnapshot(UserState.username);
    ctx.patchState({
      isHost: true,
      players: [username],
    });

    return this.ablyService.getChannel(username, roomId).pipe(
      tap(() => {
        ctx.patchState({
          status: EGameStatus.Initiated,
        });
      }),
      map(() => roomId),
    );
  }

  @Action(GameActions.JoinGame)
  joinGame(
    ctx: StateContext<GameStateModel>,
    { roomId }: GameActions.JoinGame
  ) {

    const username = this.store.selectSnapshot(UserState.username);

    return this.ablyService.getChannel(username, roomId).pipe(
      tap(() => {
        ctx.patchState({
          status: EGameStatus.Initiated,
        });
      }),
      map(() => roomId),
    );

  }

  @Action(GameActions.StartGame)
  startGame(
    ctx: StateContext<GameStateModel>,
  ) {

    ctx.patchState({
      status: EGameStatus.Started,
    })

  }

  @Action(GameActions.AddPlayer)
  addPlayer(
    ctx: StateContext<GameStateModel>,
    { player }: GameActions.AddPlayer
  ) {

    ctx.setState(
      patch<GameStateModel>({
        players: append<string>([player])
      })
    );
  }

  @Action(GameActions.SyncGame)
  syncPlayer(
    ctx: StateContext<GameStateModel>,
    { gameState }: GameActions.SyncGame
  ) {

    ctx.patchState({
      ...gameState
    })
  }
}
