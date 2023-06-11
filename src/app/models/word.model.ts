export interface IWordResponse {
  word: string;
  results: IResult[];
}

export interface IResult {
  definition: string;
}

export interface IWordsResponse {
  words: string[];
}

export interface IDefinitionsResponse {
  word: string;
  definitions: string[];
}

