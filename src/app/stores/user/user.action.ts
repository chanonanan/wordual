export namespace UserActions {
  export class SetUsername {
    static readonly type = '[User] Set Username';
    constructor(public username: string) { }
  }
}
