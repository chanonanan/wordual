import { GameStateModel } from '@stores/game/game.state';

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

  export class CreateGame {
    static readonly type = '[Game] Create Game';
    constructor(public roomId: string) { }
  }

  export class JoinGame {
    static readonly type = '[Game] Join Game';
    constructor(public roomId: string) { }
  }

  export class StartGame {
    static readonly type = '[Game] Start Game';
  }

  export class AddPlayer {
    static readonly type = '[Game] Add Player';
    constructor(public player: string) { }
  }

  export class SyncGame {
    static readonly type = '[Game] Sync Game';
    constructor(public gameState: Partial<GameStateModel>) { }
  }
}
