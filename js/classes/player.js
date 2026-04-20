import {
  TRAINER_MOVEMENT_SPEED_MS,
  TRAINER_SPRITE_SIZE,
} from '../constants/player.js';
import { STATE_BACKUP_THRESHOLD } from '../constants/state.js';
import { Character } from './character.js';

const INPUT_TO_DIRECTION = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};

export class Player extends Character {
  constructor(
    game,
    enableMovement = false,
    x = null,
    y = null,
    direction = 'down',
  ) {
    super(game, {
      spriteName: 'player',
      x,
      y,
      direction,
      enableMovement,
      centerOnScreen: true,
    });

    this.width = TRAINER_SPRITE_SIZE;
    this.height = TRAINER_SPRITE_SIZE;
    this.moveDuration = TRAINER_MOVEMENT_SPEED_MS;
  }

  _startMovement(input) {
    const key = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].find((k) =>
      input.includes(k),
    );
    if (!key) return;

    this._startMovementByDirection(INPUT_TO_DIRECTION[key]);
  }

  _startMovementByDirection(direction) {
    super._startMovement(direction, { playBlockedSfx: true });
  }

  _onMovementComplete() {
    this.game.map?.portal.detectMove(this, this.game);

    if (this.game.state.stepsSinceBackup >= STATE_BACKUP_THRESHOLD) {
      this.game.state.saveStateBackup({
        player: this,
        mapKey: this.game.map.currentMapKey,
      });
    } else {
      this.game.state.stepsSinceBackup++;
    }
  }

  update(input, deltaTime, fps) {
    if (this.isMoving) {
      this._update(deltaTime, fps);
      if (this.isMoving || !this.enableMovement) return; // still mid-step, wait
      // movement just finished — check if a portal disabled movement inside _updatePosition
      // otherwise fall through to check input immediately
    }

    if (input.length === 0) return;
    this._startMovement(input);
  }
}
