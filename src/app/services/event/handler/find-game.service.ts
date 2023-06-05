import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { REQUEST_ROOM_DATA, ROOM_DATA_RESULT } from '@consts/channel.const';
import { IPlayerData, IRoomData } from '@models/channel.model';
import { ActionCompletion, ofActionCompleted } from '@ngxs/store';
import { BaseEventHandlerService } from '@services/event/handler/base-handler.srevice';
import { GameActions } from '@stores/game/game.action';
import { RoomActions } from '@stores/room/room.action';
import { Observable, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FindGameEventHandlerService extends BaseEventHandlerService {

  private findGame$!: Observable<ActionCompletion<GameActions.FindGame, Error>>
  protected override init() {
    this.findGame$ = this.actions.pipe(
      takeUntilDestroyed(this.destroyRef),
      ofActionCompleted(GameActions.FindGame)
    );

    this.afterNavigation();
    this.syncRooms();
  }

  private afterNavigation() {
    this.findGame$.pipe(
      this.afterNavigatedEnd<GameActions.FindGame>('room-list'),
    ).subscribe(() => {
      this.ablyService.publishRoom<IPlayerData>(REQUEST_ROOM_DATA, this.playerUtil.getPlayerData());
    });
  }

  private syncRooms(): void {
    this.findGame$.pipe(
      switchMap(() => this.ablyService.subscribeRoom<IRoomData>(ROOM_DATA_RESULT))
    ).subscribe(data => {
      this.store.dispatch(new RoomActions.SetRoomData(data));
    });
  }
}
