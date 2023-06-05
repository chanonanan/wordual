import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActionCompletion, ofActionCompleted } from '@ngxs/store';
import { BaseEventHandlerService } from '@services/event/handler/base-handler.srevice';
import { GameActions } from '@stores/game/game.action';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StartGameEventHandlerService extends BaseEventHandlerService {

  private startGame$!: Observable<ActionCompletion<GameActions.FindGame, Error>>
  protected override init() {
    this.startGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.StartGame)
    );
    this.ablyService.subscribe()
  }

  private subscribeGameData() {
    this.
  }

  // private afterNavigation() {
  //   this.findGame$.pipe(
  //     this.afterNavigatedEnd<GameActions.FindGame>('room-list'),
  //   ).subscribe(() => {
  //     this.ablyService.publishRoom<IPlayerData>(REQUEST_ROOM_DATA, this.playerUtil.getPlayerData());
  //   });
  // }

  // private syncRooms(): void {
  //   this.findGame$.pipe(
  //     switchMap(() => this.ablyService.subscribeRoom<IRoomData>(ROOM_DATA_RESULT))
  //   ).subscribe(data => {
  //     this.store.dispatch(new RoomActions.SetRoomData(data));
  //   });
  // }
}
