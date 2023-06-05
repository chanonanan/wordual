import { DestroyRef, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EGameStatus } from '@models/game.model';
import { ActionCompletion, Actions, Store } from '@ngxs/store';
import { AblyService } from '@services/ably/ably.service';
import { ToastService } from '@services/toast/toast.service';
import { GameActions } from '@stores/game/game.action';
import { PlayerUtil } from '@utils/player.util';
import { RoomUtil } from '@utils/room.util';
import { Observable, OperatorFunction, filter, from, switchMap } from 'rxjs';

@Injectable()
export class BaseEventHandlerService {
  constructor(
    protected ablyService: AblyService,
    protected actions: Actions,
    protected destroyRef: DestroyRef,
    protected router: Router,
    protected route: ActivatedRoute,
    protected store: Store,
    protected toast: ToastService,
    protected playerUtil: PlayerUtil,
    protected roomUtil: RoomUtil,
  ){
    this.init()
  }

  protected init() {}

  protected checkGameStart(status: EGameStatus | undefined, isHost: boolean): void {
    switch (status) {
      case EGameStatus.Started:
        const roomId = this.route.snapshot.queryParamMap.get('roomId');
        this.router.navigate(['game'], {
          queryParams: { roomId, isAuthenicated: true }
        });
        break;
      case EGameStatus.NotInitiated:
        if (isHost) {
          return;
        }
        this.toast.showToast(`Host has left the game!`, 'error');
        this.ablyService.unsubscribe();
        this.router.navigate(['']);
        break;
    }
  }

  protected afterNavigatedEnd<T = GameActions.CreateGame | GameActions.JoinGame | GameActions.FindGame>(
    page: string
  ): OperatorFunction<ActionCompletion<T, Error>, boolean> {
    return (source: Observable<ActionCompletion<T, Error>>): Observable<boolean> => {
        return source.pipe(
          switchMap(({ action }) => from(this.router.navigate([page], {
            ...((action as GameActions.JoinGame).roomId ? {
              queryParams: { roomId: (action as GameActions.JoinGame).roomId }
            } : {}),
          })).pipe(
            filter(Boolean)
          )),
        )
    };
  }
}
