import { GameStateModel } from '@stores/game/game.state';
import { Types } from 'ably';

export interface IBaseMessage<T> extends Types.Message {
  data: T;
};

export interface ISyncGameData extends Partial<GameStateModel> {};
export interface IPlayerJoinData {
  player: string;
};