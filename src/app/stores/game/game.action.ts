export namespace GameActions {
  export class AddCharacter {
    static readonly type = '[Game] Add Character';
    constructor(public character: string) { }
  }

  export class RemoveCharacter {
    static readonly type = '[Game] Remove Character';
  }

  export class EnterWord {
    static readonly type = '[Game] Enter Word';
  }
}
