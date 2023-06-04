import { EGameStatus } from '@models/game.model';
import { Types } from 'ably';

export interface IBaseMessage<T> extends Types.Message {
  data: T;
};

export interface ISyncGameData {
  players: string[];
  status: EGameStatus;
  answer: string;
};
export interface IPlayerJoinData {
  player: string;
};

export interface IUsernameValidation {
  status: EGameStatus;
  isValid: boolean;
}
