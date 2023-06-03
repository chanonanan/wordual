import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GAME_STATUS, REQUEST_GAME_STATUS } from '@consts/channel.const';
import { EGameStatus } from '@models/game.model';
import { Store } from '@ngxs/store';
import { AblyService } from '@services/ably/ably.service';
import { GameState } from '@stores/game/game.state';
import { UserState } from '@stores/user/user.state';
import { TimeoutError, catchError, map, of, timeout } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);
  const isUsernameValid = store.selectSnapshot(UserState.isUsernameValid);
  const isHost = store.selectSnapshot(GameState.isHost);
  console.log({isHost})

  const id = route.params['id'];

  if (!id) {
    console.log({id})
    router.navigate(['']);
    return false;
  }

  if (!isUsernameValid) {
    console.log({isUsernameValid})
    router.navigate([''], {
      queryParams: {
        room: id
      }
    });
    return false;
  }

  if (isHost) {
    return true;
  }


  const ablyService = inject(AblyService);
  ablyService.publish(REQUEST_GAME_STATUS, { player: store.selectSnapshot(UserState.username) });
  return ablyService.subscribe<{ status: EGameStatus, isNameDuplicated: boolean }>(GAME_STATUS).pipe(
    map(({ status, isNameDuplicated }) => {
      if (isNameDuplicated) {
        alert('Name duplicated!');
        return false;
      }

      if (status === EGameStatus.Started) {
        alert('Game\'s already started!');
        router.navigate(['']);
        return false;
      }

      return true;
    }),
    timeout(2000),
    catchError(error => {
      console.error(error)
      if (error instanceof TimeoutError) {
        alert('Game not found!');
        router.navigate(['']);
      }
      return of(false);
    }),
  );
};
