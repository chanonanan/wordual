import { Injectable, inject } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AblyService } from '@services/ably/ably.service';
import { v4 } from 'uuid';
import { UserActions } from './user.action';

class UserStateModel {
  public username!: string;
  public uuid: string = v4();
};

@State<UserStateModel>({
  name: 'UserState',
  defaults: new UserStateModel(),
})
@Injectable()
export class UserState {
  private ablyService = inject(AblyService);

  @Selector()
  public static username(state: UserStateModel): string {
    return state.username || '';
  }

  @Selector()
  public static uuid(state: UserStateModel): string {
    return state.uuid || '';
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

    if (username === ctx.getState().username) {
      return;
    }

    ctx.patchState({
      username,
    })
  }

  // ngxsAfterBootstrap(ctx: StateContext<UserStateModel>) {
  //   this.ablyService.generateClient(ctx.getState().uuid).pipe(
  //     first()
  //   ).subscribe();
  // }
}
