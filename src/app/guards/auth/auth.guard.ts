import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { REQUEST_USERNAME_VALIDATION, USERNAME_VALIDATION_RESULT } from '@consts/channel.const';
import { IPlayerData, IUsernameValidation } from '@models/channel.model';
import { EGameStatus } from '@models/game.model';
import { Store } from '@ngxs/store';
import { AblyService } from '@services/ably/ably.service';
import { ToastService } from '@services/toast/toast.service';
import { GameState, GameStateModel } from '@stores/game/game.state';
import { UserState } from '@stores/user/user.state';
import { PlayerUtil } from '@utils/player.util';
import { TimeoutError, catchError, map, of, switchMap, tap, timeout } from 'rxjs';
import { validate } from 'uuid';

export const QueryParamsGuard: CanActivateFn = (route, state) => {
  isTestGuard(route);
  const router = inject(Router);
  const roomId = route.queryParamMap.get('roomId');

  if (!roomId) {
    console.log({roomId})
    router.navigate(['']);
    return false;
  }

  return true
};

export const GameStatusGuard: CanActivateFn = (route, state) => {
  console.log('GameStatusGuard');
  isTestGuard(route);
  const router = inject(Router);
  const store = inject(Store);

  const { isHost, status } = store.selectSnapshot<GameStateModel>(GameState);
  const roomId = route.queryParamMap.get('roomId');
  const isAuthenicated = route.queryParamMap.get('isAuthenicated');
  console.log({status, roomId});

  if (status < EGameStatus.Initiated) {
    console.log({status})
    router.navigate([''], {
      queryParams: {
        roomId,
      }
    });
    return false;
  }

  return true;
};


export const UsernameGuard: CanActivateFn = (route, state) => {
  console.log('UsernameGuard');
  isTestGuard(route);
  const router = inject(Router);
  const store = inject(Store);
  const isUsernameValid = store.selectSnapshot(UserState.isUsernameValid);

  if (!isUsernameValid) {
    router.navigate(['']);
    return false;
  }


  return true;
};

export const RoomConnectionGuard: CanActivateFn = (route, state) => {
  console.log('RoomConnectionGuard');
  isTestGuard(route);
  const router = inject(Router);
  const ablyService = inject(AblyService);
  const playerUtil = inject(PlayerUtil);
  const toast = inject(ToastService);
  const store = inject(Store);
  const roomId = route.queryParamMap.get('roomId');
  const { isHost } = store.selectSnapshot<GameStateModel>(GameState);

  if (!roomId) {
    return false;
  }

  return isHost || verifiedWithHost({ ablyService, playerUtil, toast, router }, roomId);
};

export const HomeGuard: CanActivateFn = (route, state) => {
  console.log('HomeGuard');
  isTestGuard(route);
  const router = inject(Router);
  const ablyService = inject(AblyService);
  const playerUtil = inject(PlayerUtil);
  const toast = inject(ToastService);
  const roomId = route.queryParamMap.get('roomId');
  const isValidName = route.queryParamMap.get('isValidName');

  if (!roomId || isValidName === 'false') {
    return true;
  }

  return verifiedWithHost({ ablyService, playerUtil, toast, router }, roomId);
};

const isTestGuard = (route: ActivatedRouteSnapshot): boolean | void => {
  if (route.queryParamMap.get('isTest')) {
    return true;
  }
}

const verifiedWithHost = (
  services: {
    ablyService: AblyService,
    router: Router,
    toast: ToastService,
    playerUtil: PlayerUtil,
  },
  roomId: string,
) => {
  const { ablyService, router, toast, playerUtil } = services;

  if (!validate(roomId)) {
    toast.showToast(`RoomID's invalid`, 'error');
    router.navigate(['']);
    return false;
  }

  const player = playerUtil.getPlayerData();
  return ablyService.generateClient(player.uuid, roomId).pipe(
    tap(() => ablyService.publish<IPlayerData>(REQUEST_USERNAME_VALIDATION, player)),
    switchMap(() => ablyService.subscribe<IUsernameValidation>(USERNAME_VALIDATION_RESULT)),
    map(({ status, isValidName }) => {
      if (!isValidName) {
        toast.showToast(`Name's duplicated!`, 'error');
        router.navigate([''], {
          queryParams: {
            roomId,
            isValidName,
          }
        });
        return false;
      }

      if (status === EGameStatus.Started) {
        toast.showToast(`Game's already started!`, 'error');
        router.navigate(['']);
        return false;
      }

      return true;
    }),
    timeout(2000),
    catchError(error => {
      console.error(error)
      if (error instanceof TimeoutError) {
        toast.showToast(`Game not found!`, 'error');
        router.navigate(['']);
      }
      return of(false);
    }),
  );
};
