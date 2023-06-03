import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { UserActions } from './user.action';

class UserStateModel {
  public username!: string;
};

@State<UserStateModel>({
  name: 'UserState',
  defaults: new UserStateModel(),
})
@Injectable()
export class UserState {
  @Selector()
  public static username(state: UserStateModel): string {
    return state.username;
  }

  @Selector([UserState.username])
  public static isUsernameValid(state: UserStateModel, username: string): boolean {
    return !!username?.length;
  }

  @Action(UserActions.SetUsername)
  setUsername(
    ctx: StateContext<UserStateModel>,
    { username }: UserActions.SetUsername,
  ) {

    ctx.patchState({
      username,
    })
  }
}
