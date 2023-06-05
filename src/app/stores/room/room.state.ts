import { Injectable } from '@angular/core';
import { IRoomData } from '@models/channel.model';
import { Action, Selector, State, StateContext } from '@ngxs/store';
import { append, iif, patch, removeItem, updateItem } from '@ngxs/store/operators';
import { RoomActions } from '@stores/room/room.action';

class RoomStateModel {
  public rooms: IRoomData[] = [];
};

@State<RoomStateModel>({
  name: 'RoomState',
  defaults: new RoomStateModel(),
})
@Injectable()
export class RoomState {
  @Selector()
  public static rooms(state: RoomStateModel): IRoomData[] {
    return state.rooms;
  }

  @Action(RoomActions.SetRoomData)
  setUsername(
    ctx: StateContext<RoomStateModel>,
    action: RoomActions.SetRoomData,
  ) {

    if (!action.room.roomId) {
      ctx.setState(
        patch<RoomStateModel>({
          rooms: removeItem<IRoomData>((room) => room.host.uuid === action.room.host.uuid)
        })
      );
      return;
    }

    ctx.setState(
      patch<RoomStateModel>({
        rooms: iif<IRoomData[]>(
          (rooms => !!rooms?.find(room => room.host.uuid === action.room.host.uuid)),
          updateItem<IRoomData>(
            (room) => room.host.uuid === action.room.host.uuid,
            action.room
          ),
          append<IRoomData>([action.room])
        )
      })
    );
  }
}
