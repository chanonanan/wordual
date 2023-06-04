import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { IWordsResponse } from '@models/word.model';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { WordActions } from '@stores/word/word.action';
import { first } from 'rxjs';

class WordStateModel {
  public word!: string;
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
    { word }: WordActions.SetWord
  ) {
    ctx.patchState({
      word,
    })
  }

  @Action(WordActions.GetNewWord)
  getNewWord(
    ctx: StateContext<WordStateModel>,
  ) {

    const { words } = ctx.getState()
    const word = words[Math.floor(Math.random() * words.length)];
    const setWords = new Set(words);

    setWords.delete(word);
    ctx.patchState({
      word,
      words: [...setWords],
    })
  }

  ngxsAfterBootstrap(ctx: StateContext<WordStateModel>) {
    this.http.get<IWordsResponse>('/api/words').pipe(
      first()
    ).subscribe(response => {
      ctx.dispatch(new WordActions.SetWords(response.words));
    });
  }
}
