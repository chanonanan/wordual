import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { IDefinitionsResponse, IWordsResponse } from '@models/word.model';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { WordActions } from '@stores/word/word.action';
import { first, tap } from 'rxjs';

class WordStateModel {
  public word!: string;
  public definitions!: string[];
  public words!: string[];
};

@State<WordStateModel>({
  name: 'WordState',
  defaults: new WordStateModel(),
})
@Injectable()
export class WordState {

  private http = inject(HttpClient);

  @Selector()
  public static word(state: WordStateModel): string {
    return state.word;
  }

  @Selector()
  public static words(state: WordStateModel): string[] {
    return state.words;
  }

  @Selector()
  public static definitions(state: WordStateModel): string[] {
    return state.definitions;
  }

  @Selector([WordState.words])
  public static wordsSet(state: WordStateModel, words: string[]): Set<string> {
    return new Set(words);
  }

  @Selector([WordState.word, WordState.definitions])
  public static wordWithDefinitions(state: WordStateModel, word: string, definitions: string[]): IDefinitionsResponse {
    return { word, definitions };
  }

  @Action(WordActions.SetWords)
  setWords(
    ctx: StateContext<WordStateModel>,
    { words }: WordActions.SetWords
  ) {
    ctx.patchState({
      words,
    })
  }

  @Action(WordActions.SetWord)
  setWord(
    ctx: StateContext<WordStateModel>,
    { wordWithDefinitions: { word, definitions } }: WordActions.SetWord
  ) {
    ctx.patchState({
      word,
      definitions,
    })
  }

  @Action(WordActions.GetNewWord)
  getNewWord(
    ctx: StateContext<WordStateModel>,
  ) {

    const { words } = ctx.getState()
    const word = words[Math.floor(Math.random() * words.length)];

    return this.http.get<IDefinitionsResponse>(`/api/definitions?word=${word}`).pipe(
      first(),
      tap(response => ctx.patchState({
        word,
        definitions: response.definitions
      }))
    )
  }

  ngxsAfterBootstrap(ctx: StateContext<WordStateModel>) {
    if (!ctx.getState().words?.length) {
      this.http.get<IWordsResponse>('/api/words').pipe(
        first()
      ).subscribe(response => {
        ctx.dispatch(new WordActions.SetWords(response.words));
      });
    }
  }
}
