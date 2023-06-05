import { ERoundStatus } from '@models/game.model';

export interface IPlayerData {
  uuid: string;
  name: string;
  roundStatus: ERoundStatus;
}
