import { EGridStatus } from '@models/grid.model';

export const validateWord = (guessed: string, answer: string) => {
  let answerArray: (string | undefined)[] = answer.split('');
  return guessed.split('').map((letter, index) => {
    if (!answerArray.includes(letter)) {
      return { letter, status: EGridStatus.NOT_IN_WORD };
    }

    if (answerArray[index] === letter) {
      answerArray[index] = undefined;
      return { letter, status: EGridStatus.RIGHT_POSITION };
    }

    const letterPosition = answerArray.findIndex(a => a === letter);
    if (guessed[letterPosition] === letter) {
      return { letter, status: EGridStatus.NOT_IN_WORD };
    }

    answerArray[letterPosition] = undefined;
    return { letter, status: EGridStatus.WRONG_POSITION };
  })
};
