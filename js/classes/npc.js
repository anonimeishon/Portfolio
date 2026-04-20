import { Dialog } from './dialog.js';
import { Character } from './character.js';

export class Npc extends Character {
  constructor(
    game,
    {
      name = 'npc',
      spriteName = 'mainCharacter',
      x = null,
      y = null,
      direction = 'down',
      dialog = '',
      movementPattern = [],
      movementPatternDelay = 350,
      blockedMoveDelay = 250,
    } = {},
  ) {
    super(game, {
      spriteName,
      x,
      y,
      direction,
      enableMovement: false,
      centerOnScreen: false,
    });

    this.name = name;
    this.dialog = new Dialog(dialog);
    this.movementPattern = movementPattern;
    this.movementPatternDelay = movementPatternDelay;
    this.blockedMoveDelay = blockedMoveDelay;
    this._movementPatternIndex = 0;
    this._movementPatternElapsed = 0;
  }

  isFacing(player) {
    return player.facingX === this.x && player.facingY === this.y;
  }

  _faceToward(targetX, targetY) {
    const dx = targetX - this.x;
    const dy = targetY - this.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > absDy) {
      this.direction = dx > 0 ? 'right' : 'left';
    } else {
      this.direction = dy > 0 ? 'down' : 'up';
    }

    this.currentFrame = this.frames[this.direction].neutral;
    this._updateFacing();
  }

  _advanceMovementPattern() {
    if (!this.movementPattern.length) return null;

    const step = this.movementPattern[this._movementPatternIndex];
    this._movementPatternIndex =
      (this._movementPatternIndex + 1) % this.movementPattern.length;
    return step;
  }

  _runMovementPattern(deltaTime) {
    if (!this.movementPattern.length || this.isMoving) return;

    this._movementPatternElapsed += deltaTime;

    if (this._movementPatternElapsed < this.movementPatternDelay) return;

    const step = this._advanceMovementPattern();
    if (!step) return;

    if (typeof step === 'string') {
      const started = this._startMovement(step);
      this._movementPatternElapsed = 0;
      this.movementPatternDelay = started
        ? this.moveDuration
        : this.blockedMoveDelay;
      return;
    }

    if (typeof step.waitMs === 'number') {
      this._movementPatternElapsed = 0;
      this.movementPatternDelay = step.waitMs;
      return;
    }

    const started = this._startMovement(step.direction);
    const pauseMs = step.pauseMs ?? 350;
    this._movementPatternElapsed = 0;
    this.movementPatternDelay = started
      ? this.moveDuration + pauseMs
      : this.blockedMoveDelay;
  }

  update(_input, deltaTime, fps) {
    const isInteracting = this.game.state.activeEvent === this;
    if (isInteracting) {
      this._faceToward(this.game.player.x, this.game.player.y);
      // Don't run movement pattern while talking
      this._update(deltaTime, fps);
    } else {
      this._update(deltaTime, fps);
      this._runMovementPattern(deltaTime);
    }
  }
}
