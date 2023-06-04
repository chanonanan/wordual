export namespace WordActions {
  export class SetWords {
    static readonly type = '[Word] Set Words';
    constructor(public words: string[]) { }
  }

  export class SetWord {
    static readonly type = '[Word] Set Word';
    constructor(public word: string) { }
  }

  export class GetNewWord {
    static readonly type = '[Word] Get New Word';
  }

  export class CheckWord {
    static readonly type = '[Word] Check Word';
  }
}
