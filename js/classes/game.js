/**
 * @import {TileMap} from './tileMap.js';
 */
import { InputHandler } from '../handlers/inputHandler.js';
import { Player } from './player.js';
import { maps } from '../maps/index.js';

const TRANSITION_STEPS = [0.2, 0.6, 1]; // alpha at each step
const FRAMES_PER_STEP = 4; // game frames to hold each step

export class Game {
  /**
   * @param {number} width
   * @param {number} height
   * @param {HTMLCanvasElement} canvas
   * @param {TileMap} map
   */
  constructor(width, height, canvas, map) {
    this.width = width;
    this.height = height;
    this.canvas = canvas;
    this.map = map;
    this.player = new Player(this, true);
    this.input = new InputHandler(canvas);
    this.fps = 30;
    this.frameInterval = 1000 / this.fps;
    this.lastTime = 0;

    // Transition state
    this._transition = null; // null when idle
  }

  // World position of the viewport's top-left corner, keeping the player centered.
  // Math.round keeps tile draws on integer pixels, preventing sub-pixel gaps.
  get cameraX() {
    return Math.round(this.player.x - this.width / 2 + this.player.width / 2);
  }

  get cameraY() {
    return Math.round(this.player.y - this.height / 2 + this.player.height / 2);
  }

  /**
   * Begins a fade-out → map swap → fade-in transition.
   * @param {string} mapKey
   * @param {number} targetX
   * @param {number} targetY
   */
  startTransition(mapKey, targetX, targetY) {
    this.player.enableMovement = false; // block input during transition
    this._transition = {
      phase: 'fadeOut', // 'fadeOut' | 'fadeIn'
      stepIndex: -1,
      framesHeld: FRAMES_PER_STEP - 1, // advance on the very next frame
      mapKey,
      targetX,
      targetY,
    };
  }

  _updateTransition() {
    const t = this._transition;

    t.framesHeld++;
    if (t.framesHeld < FRAMES_PER_STEP) return;
    t.framesHeld = 0;

    if (t.phase === 'fadeOut') {
      t.stepIndex++;
      if (t.stepIndex >= TRANSITION_STEPS.length) {
        // Fully black — swap map and teleport player
        this.loadMap(t.mapKey);
        this.player.x = t.targetX;
        this.player.y = t.targetY;
        t.phase = 'fadeIn';
        t.stepIndex = TRANSITION_STEPS.length - 1;
      }
    } else {
      t.stepIndex--;
      if (t.stepIndex < 0) {
        this._transition = null; // done
        this.player.enableMovement = true;
        return;
      }
    }
  }

  get _transitionAlpha() {
    const t = this._transition;
    if (t.stepIndex < 0) return 0;
    const idx = Math.min(t.stepIndex, TRANSITION_STEPS.length - 1);
    return TRANSITION_STEPS[idx];
  }

  _drawTransition(context) {
    context.save();
    context.globalAlpha = this._transitionAlpha;
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.width, this.height);
    context.restore();
  }
  update(deltaTime, fps) {
    if (this._transition) {
      this._updateTransition();
      return; // block player input during transition
    }
    this.player.update(this.input.keys, deltaTime, fps);
  }

  loadMap(mapKey) {
    if (!maps[mapKey]) throw new Error(`Unknown map: "${mapKey}"`);
    this.map = new maps[mapKey]();
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.width, this.height);
    this.map.draw(context, this.cameraX, this.cameraY);
    this.player.draw(context);
    if (this._transition) this._drawTransition(context);
  }
  animate(context, timeStamp = 0) {
    const deltaTime = timeStamp - this.lastTime;

    if (deltaTime >= this.frameInterval) {
      // Snap lastTime forward without accumulating drift
      this.lastTime = timeStamp - (deltaTime % this.frameInterval);
      context.clearRect(0, 0, this.width, this.height);
      this.update(deltaTime, this.fps);
      this.draw(context);
    }

    requestAnimationFrame((timeStamp) => this.animate(context, timeStamp));
  }
}
