import { IRoomData } from '@models/channel.model';

export namespace RoomActions {
  export class SetRoomData {
    static readonly type = '[Room] Set Room Data';
    constructor(public room: IRoomData) { }
  }
}
