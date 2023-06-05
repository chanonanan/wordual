import { EGameStatus, ERoundStatus } from '@models/game.model';
import { Types } from 'ably';

export interface IBaseMessage<T> extends Types.Message {
  data: T;
};

export interface ISyncGameData {
  players: IPlayerData[];
  status: EGameStatus;
  answer: string;
};
export interface IPlayerData {
  uuid: string;
  name: string;
  roundStatus: ERoundStatus;
};

export interface IUsernameValidation {
  status: EGameStatus;
  isValidName: boolean;
}

export interface IRoomData {
  host: IPlayerData;
  players: IPlayerData[];
  roomId: string;
  status: EGameStatus;
}
