import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { REQUEST_USERNAME_VALIDATION, USERNAME_VALIDATION_RESULT } from '@consts/channel.const';
import { IPlayerJoinData, IUsernameValidation } from '@models/channel.model';
import { EGameStatus } from '@models/game.model';
import { Store } from '@ngxs/store';
import { AblyService } from '@services/ably/ably.service';
import { GameState, GameStateModel } from '@stores/game/game.state';
import { UserState } from '@stores/user/user.state';
import { EMPTY, TimeoutError, catchError, map, of, switchMap, tap, timeout } from 'rxjs';

export const AuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const store = inject(Store);
  const ablyService = inject(AblyService);

  const { isHost, status } = store.selectSnapshot<GameStateModel>(GameState);
  const roomId = route.queryParamMap.get('roomId');
  const isAuthenicated = route.queryParamMap.get('isAuthenicated');
  console.log({isHost, status, roomId});

  if (!roomId) {
    console.log({roomId})
    router.navigate(['']);
    return false;
  }

  if (status < EGameStatus.Initiated) {
    console.log({status})
    router.navigate([''], {
      queryParams: {
        roomId,
      }
    });
    return false;
  }

  if (isHost || isAuthenicated === 'true') {
    return true;
  }

  return verifiedWithHost(ablyService, router, store);
};

const verifiedWithHost = (
  ablyService: AblyService,
  router: Router,
  store: Store,
) => {
  const player = store.selectSnapshot(UserState.username);
  return of(EMPTY).pipe(
    tap(() => ablyService.publish<IPlayerJoinData>(REQUEST_USERNAME_VALIDATION, { player })),
    switchMap(() => ablyService.subscribe<IUsernameValidation>(USERNAME_VALIDATION_RESULT)),
    map(({ status, isValid }) => {
      if (!isValid) {
        alert('Name\'s duplicated!');
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
