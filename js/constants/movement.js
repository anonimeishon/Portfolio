export const MOVEMENT_KEYS = {
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
};

export const TRAINER_MOVE_STEP = 64;

export const directions = {
  [MOVEMENT_KEYS.ArrowUp]: { dx: 0, dy: -TRAINER_MOVE_STEP, dir: 'up' },
  [MOVEMENT_KEYS.ArrowDown]: { dx: 0, dy: TRAINER_MOVE_STEP, dir: 'down' },
  [MOVEMENT_KEYS.ArrowLeft]: { dx: -TRAINER_MOVE_STEP, dy: 0, dir: 'left' },
  [MOVEMENT_KEYS.ArrowRight]: { dx: TRAINER_MOVE_STEP, dy: 0, dir: 'right' },
};

/** Lookup dx/dy by direction string ('up' | 'down' | 'left' | 'right') */
export const directionDeltas = {
  up: { dx: 0, dy: -TRAINER_MOVE_STEP },
  down: { dx: 0, dy: TRAINER_MOVE_STEP },
  left: { dx: -TRAINER_MOVE_STEP, dy: 0 },
  right: { dx: TRAINER_MOVE_STEP, dy: 0 },
};
