import { Injectable } from '@angular/core';
import { EGridStatus, IGridData } from '@models/grid.model';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, patch, removeItem } from '@ngxs/store/operators';
import { GameActions } from './game.action';

class GameStateModel {
  public answer: string = 'chano';
  public word: string[] = [];
  public histories: IGridData[][] = [];
};

@State<GameStateModel>({
  name: 'GameState',
  defaults: new GameStateModel(),
})
@Injectable()
export class GameState {
  @Selector()
  public static word(state: GameStateModel): string[] {
    return state.word;
  }

  @Selector()
  public static histories(state: GameStateModel): IGridData[][] {
    return state.histories;
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
}
