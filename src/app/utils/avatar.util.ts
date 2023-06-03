import { adventurer } from '@dicebear/collection';
import { createAvatar } from '@dicebear/core';

export const getAvatar = (name: string): string => {
  return createAvatar(adventurer, {
    seed: name
  }).toDataUriSync();
}
