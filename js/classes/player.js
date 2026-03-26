import {
  TRAINER_MOVEMENT_SPEED_MS,
  TRAINER_SPRITE_SIZE,
} from '../constants/player.js';
import { sharedLoader } from '../utils/assetLoader.js';
import { SfxPlayer } from './sounds/sfxPlayer.js';
import { ASSETS_BASE } from '../constants/assets.js';
import { TRAINER_MOVE_STEP } from '../constants/movement.js';

const directions = {
  ArrowUp: { dx: 0, dy: -TRAINER_MOVE_STEP, dir: 'up' },
  ArrowDown: { dx: 0, dy: TRAINER_MOVE_STEP, dir: 'down' },
  ArrowLeft: { dx: -TRAINER_MOVE_STEP, dy: 0, dir: 'left' },
  ArrowRight: { dx: TRAINER_MOVE_STEP, dy: 0, dir: 'right' },
};

await sharedLoader.loadImage(
  'trainer',
  `${ASSETS_BASE}sprites/pokemon_gen_1_trainer_sprite.png`,
);

const debugScale = 4;
export class Player {
  constructor(game, enableMovement = false) {
    this.game = game;
    this.width = TRAINER_SPRITE_SIZE;
    this.height = TRAINER_SPRITE_SIZE;
    // World-space starting position (tile-aligned)
    this.x = this.game.width - TRAINER_SPRITE_SIZE * 2;
    this.y = TRAINER_SPRITE_SIZE;
    this.sprite = this._trainerSprite();

    // Tile-based movement properties
    this.isMoving = false;
    this.moveStartX = this.x;
    this.moveStartY = this.y;
    this.targetX = this.x;
    this.targetY = this.y;
    this.moveStartTime = 0;
    this.moveDuration = TRAINER_MOVEMENT_SPEED_MS;
    this.direction = 'down'; // current facing direction
    this.footIndex = 0; // alternates 0/1 for walk cycle
    this.currentFrame = this.frames['down'].neutral;
    this.sfxPlayer = new SfxPlayer(game.canvas);
    this.enableMovement = enableMovement;
  }
  _trainerSprite() {
    return sharedLoader.get('trainer');
  }

  _startMovement(input) {
    const key = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].find((k) =>
      input.includes(k),
    );
    if (!key) return;

    const { dx, dy, dir } = directions[key];
    this.direction = dir;
    this.currentFrame = this.frames[dir].neutral; // face direction immediately

    // Snap to tile grid (guards against floating point drift)
    let newTargetX =
      Math.floor((this.x + dx) / TRAINER_MOVE_STEP) * TRAINER_MOVE_STEP;
    let newTargetY =
      Math.floor((this.y + dy) / TRAINER_MOVE_STEP) * TRAINER_MOVE_STEP;

    // Tile-based collision — out-of-bounds tiles are treated as solid
    if (
      this.game.map.isSolid(newTargetX, newTargetY, this.width, this.height)
    ) {
      this.sfxPlayer.play('bump');
      return;
    }

    this.moveStartX = this.x;
    this.moveStartY = this.y;
    this.targetX = newTargetX;
    this.targetY = newTargetY;
    this.moveStartTime = Date.now();
    this.isMoving = true;
  }

  _updatePosition(deltaTime, fps) {
    const elapsed = Date.now() - this.moveStartTime;
    const progress = Math.min(elapsed / this.moveDuration, 1);

    this.x = this.moveStartX + (this.targetX - this.moveStartX) * progress;
    this.y = this.moveStartY + (this.targetY - this.moveStartY) * progress;

    this.updateFrame(progress);

    if (progress >= 1) {
      this.x = this.targetX;

      this.y = this.targetY;

      this.game.map?.portal.detectMove(this, this.game);
      this.isMoving = false;
      // Only alternate foot for directions that have two walk frames
      if (this.direction === 'up' || this.direction === 'down') {
        this.footIndex = 1 - this.footIndex;
      }
    }
  }

  updateFrame(progress) {
    const frameSet = this.frames[this.direction];
    if (progress < 0.25 || progress >= 0.75) {
      this.currentFrame = frameSet.neutral;
    } else {
      this.currentFrame = frameSet.walk[this.footIndex];
    }
  }

  update(input, deltaTime, fps) {
    if (this.enableMovement) {
      if (this.isMoving) {
        this._updatePosition(deltaTime, fps);
        if (this.isMoving) return; // still mid-step, wait
        // movement just finished — fall through to check input immediately
      }

      if (input.length === 0) return;
      this._startMovement(input);
    }
  }

  draw(context) {
    // Always draw at the center of the canvas — the camera moves, not the player
    const screenX = this.game.width / 2 - this.width / 2;
    const screenY = this.game.height / 2 - this.height / 2;
    context.drawImage(
      this.sprite,
      this.currentFrame.x * debugScale,
      this.currentFrame.y * debugScale,
      this.width,
      this.height,
      screenX,
      screenY,
      this.width,
      this.height,
    );
  }
  // Frames keyed by direction — neutral + walk cycle per direction
  frames = {
    down: {
      neutral: { x: 17, y: 0 },
      walk: [
        { x: 17, y: 17 },
        { x: 17, y: 33 },
      ],
    },
    up: {
      neutral: { x: 33, y: 0 },
      walk: [
        { x: 33, y: 17 },
        { x: 33, y: 33 },
      ],
    },
    left: {
      neutral: { x: 49, y: 0 },
      walk: [
        { x: 49, y: 17 },
        { x: 49, y: 17 },
      ],
    },
    right: {
      neutral: { x: 65, y: 0 },
      walk: [
        { x: 65, y: 17 },
        { x: 65, y: 17 },
      ],
    },
  };
}
