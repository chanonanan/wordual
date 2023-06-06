import { Injectable, inject } from '@angular/core';
import { IPlayerData } from '@models/channel.model';
import { EGameStatus, ERoundStatus } from '@models/game.model';
import { EGridStatus, IGridData } from '@models/grid.model';
import { Action, Selector, State, StateContext, Store } from '@ngxs/store';
import { append, iif, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { AblyService } from '@services/ably/ably.service';
import { ToastService } from '@services/toast/toast.service';
import { UserState } from '@stores/user/user.state';
import { WordActions } from '@stores/word/word.action';
import { WordState } from '@stores/word/word.state';
import { PlayerUtil } from '@utils/player.util';
import { map, tap } from 'rxjs';
import { GameActions } from './game.action';

export class GameStateModel {
  public wordInput: string[] = [];
  public histories: string[] = [];
  public isHost: boolean = false;
  public players: IPlayerData[] = [];
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
  private ablyService = inject(AblyService);
  private toast = inject(ToastService);
  private playerUtil = inject(PlayerUtil);

  @Selector()
  public static wordInput(state: GameStateModel): string[] {
    return state.wordInput;
  }

  @Selector()
  public static histories(state: GameStateModel): string[] {
    return state.histories;
  }

  @Selector()
  public static isHost(state: GameStateModel): boolean {
    return state.isHost;
  }

  @Selector()
  public static players(state: GameStateModel): IPlayerData[] {
    return state.players;
  }

  @Selector()
  public static status(state: GameStateModel): EGameStatus {
    return state.status;
  }

  @Selector([GameState.histories, WordState.word])
  public static wordUsed(state: GameStateModel, histories: string[], answer: string): Map<string, boolean> {
    const map = new Map<string, boolean>();

    [...new Set(histories.join(''))].forEach(letter => {
      map.set(letter, answer.includes(letter))
    });

    return map;
  }

  @Selector([GameState.histories, WordState.word])
  public static isGameLose(state: GameStateModel, histories: string[], answer: string): boolean {
    const stack = histories.length;
    const isAnswerFound = !!histories.find(history => history === answer);
    return stack === 5 && !isAnswerFound;
  }

  @Selector([GameState.histories, WordState.word])
  public static isGameWin(state: GameStateModel, histories: string[], answer: string): boolean {
    const isAnswerFound = !!histories.find(history => history === answer);
    return isAnswerFound;
  }

  @Selector([GameState.histories, WordState.word])
  public static historiesDridData(state: GameStateModel, wordInput: string[], histories: string[], answer: string): IGridData[][] {
    const emptyWord = Array.from({ length: 5 }, () => ({
      letter: '',
      status: EGridStatus.EMPTY
    }));


    const historiesWithCurrent = [
      ...histories.map(history =>
        [...history].map((letter, index) => ({
          letter,
          status: !answer.includes(letter) ? EGridStatus.NOT_IN_WORD :
            (answer[index] === letter ? EGridStatus.RIGHT_POSITION : EGridStatus.WRONG_POSITION)
        }))
      ),
      Array.from({ length: 5 }, (_, index) => ({
        letter: wordInput[index] || '',
        status: EGridStatus.EMPTY
      }))
    ]

    return Array.from({ length: 6 }, (_, index) => historiesWithCurrent[index] || emptyWord);
  }

  @Selector([GameState.wordInput, GameState.histories, WordState.word])
  public static gridData(state: GameStateModel, wordInput: string[], histories: string[], answer: string): IGridData[][] {
    const emptyWord = Array.from({ length: 5 }, () => ({
      letter: '',
      status: EGridStatus.EMPTY
    }));


    const historiesWithCurrent = [
      ...histories.map(history =>
        [...history].map((letter, index) => ({
          letter,
          status: !answer.includes(letter) ? EGridStatus.NOT_IN_WORD :
            (answer[index] === letter ? EGridStatus.RIGHT_POSITION : EGridStatus.WRONG_POSITION)
        }))
      ),
      Array.from({ length: 5 }, (_, index) => ({
        letter: wordInput[index] || '',
        status: EGridStatus.EMPTY
      }))
    ]

    return Array.from({ length: 6 }, (_, index) => historiesWithCurrent[index] || emptyWord);
  }

  @Selector([GameState.players, UserState.uuid])
  public static player(state: GameStateModel, players: IPlayerData[], uuid: string): IPlayerData | undefined {
    return players.find(player => player.uuid === uuid);
  }

  @Selector([GameState.player])
  public static roundStatus(state: GameStateModel, player: IPlayerData): ERoundStatus {
    return player?.roundStatus;
  }

  @Selector([GameState.players])
  public static roundWinner(state: GameStateModel, players: IPlayerData[]): string {
    if (players.every(player => player.roundStatus === ERoundStatus.Lose)) {
      return 'No player win this round!';
    }
    const name = players.find(player => player.roundStatus === ERoundStatus.Win)?.name;

    return name ? `${name}'s winning!` : '';
  }

  @Action(GameActions.AddCharacter)
  addCharacter(
    ctx: StateContext<GameStateModel>,
    { character }: GameActions.AddCharacter,
  ) {

    const { wordInput } = ctx.getState();
    if (wordInput.length === 5) {
      return;
    }

    ctx.setState(
      patch<GameStateModel>({
        wordInput: append<string>([character])
      })
    );
  }

  @Action(GameActions.RemoveCharacter)
  removeCharacter(
    ctx: StateContext<GameStateModel>,
  ) {

    ctx.setState(
      patch<GameStateModel>({
        wordInput: removeItem<string>(ctx.getState().wordInput.length - 1)
      })
    );
  }

  @Action(GameActions.EnterWord)
  enterWord(
    ctx: StateContext<GameStateModel>,
  ) {

    const { wordInput } = ctx.getState();
    if (wordInput.length < 5) {
      this.toast.showToast(`Word's least than 5 letters!`, 'error');
      return;
    }

    const wordsSet = this.store.selectSnapshot(WordState.wordsSet);

    if (!wordsSet.has(wordInput.join(''))) {
      this.toast.showToast(`Word not found!`, 'error');
      return;
    }

    ctx.setState(
      patch<GameStateModel>({
        histories: append<string>([
          wordInput.join('')
        ]),
        wordInput: [],
      })
    );

    console.log('[DEBUG]', ctx.getState())
    console.log('[DEBUG]', this.store.selectSnapshot(GameState.isGameWin))

    const uuid = this.store.selectSnapshot(UserState.uuid);
    if (this.store.selectSnapshot(GameState.isGameLose)) {
      ctx.setState(
        patch<GameStateModel>({
          players: updateItem<IPlayerData>(
            player => player.uuid === uuid,
            patch<IPlayerData>({
              roundStatus: ERoundStatus.Lose,
            })
          )
        })
      );
    }

    if (this.store.selectSnapshot(GameState.isGameWin)) {
      ctx.setState(
        patch<GameStateModel>({
          players: updateItem<IPlayerData>(
            player => player.uuid === uuid,
            patch<IPlayerData>({
              roundStatus: ERoundStatus.Win,
            })
          )
        })
      );
    }
  }

  @Action(GameActions.CreateGame)
  createGame(
    ctx: StateContext<GameStateModel>,
    { roomId }: GameActions.CreateGame
  ) {

    const player = this.playerUtil.getPlayerData();
    ctx.patchState({
      isHost: true,
      players: [player],
    });

    return this.ablyService.generateClient(player.uuid, roomId).pipe(
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

    const uuid = this.store.selectSnapshot(UserState.uuid);

    return this.ablyService.generateClient(uuid, roomId).pipe(
      tap(() => {
        ctx.patchState({
          status: EGameStatus.Initiated,
        });
      }),
      map(() => roomId),
    );

  }

  @Action(GameActions.FindGame)
  findRoom(
    ctx: StateContext<GameStateModel>,
  ) {

    const uuid = this.store.selectSnapshot(UserState.uuid);
    return this.ablyService.generateClient(uuid);

  }

  @Action(GameActions.StartGame)
  startGame(
    ctx: StateContext<GameStateModel>,
  ) {

    ctx.patchState({
      status: EGameStatus.Started,
    })

    return ctx.dispatch(new WordActions.GetNewWord());
  }

  @Action(GameActions.SyncPlayer)
  addPlayer(
    ctx: StateContext<GameStateModel>,
    action: GameActions.SyncPlayer
  ) {

    const findPlayer = (player: IPlayerData) => player.uuid === action.player.uuid;

    if (action.player.status === EGameStatus.NotInitiated) {
      ctx.setState(
        patch<GameStateModel>({
          players: removeItem<IPlayerData>(findPlayer)
        })
      );
      return;
    }

    ctx.setState(
      patch<GameStateModel>({
        players: iif<IPlayerData[]>(
          (players) => !!players?.find(findPlayer),
          updateItem<IPlayerData>(
            findPlayer,
            action.player
          ),
          append<IPlayerData>([action.player])
        )
      })
    );
  }

  @Action(GameActions.SyncGame)
  syncPlayer(
    ctx: StateContext<GameStateModel>,
    { syncData: { status, players, answer } }: GameActions.SyncGame
  ) {

    ctx.patchState({
      status,
      players,
    })

    if (this.store.selectSnapshot(WordState.word) !== answer) {
      ctx.patchState({
        histories: [],
        wordInput: [],
      })
      this.store.dispatch(new WordActions.SetWord(answer));
    }
  }

  @Action(GameActions.NewGame)
  newGame(
    ctx: StateContext<GameStateModel>,
  ) {

    const players = ctx.getState().players.map(player => {
      return {
        ...player,
        roundStatus: ERoundStatus.NotComplete,
      }
    })

    ctx.patchState({
      players,
      histories: [],
      wordInput: [],
    })

    return ctx.dispatch(new WordActions.GetNewWord());
  }
}
