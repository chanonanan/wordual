export enum EGridStatus {
  EMPTY,
  NOT_IN_WORD,
  WRONG_POSITION,
  RIGHT_POSITION
}
export interface IGridData {
  letter: string;
  status: EGridStatus;
}
