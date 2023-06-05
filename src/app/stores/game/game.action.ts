import { IPlayerData, ISyncGameData } from '@models/channel.model';

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

  export class FindGame {
    static readonly type = '[Game] Find Game';
  }

  export class StartGame {
    static readonly type = '[Game] Start Game';
  }

  export class SyncPlayer {
    static readonly type = '[Game] Sync Player';
    constructor(public player: IPlayerData) { }
  }

  export class SyncGame {
    static readonly type = '[Game] Sync Game';
    constructor(public syncData: ISyncGameData) { }
  }

  export class NewGame {
    static readonly type = '[Game] New Game';
  }
}
