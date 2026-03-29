/**
 * @import {TileMap} from './tileMap.js';
 */
import { InputHandler } from '../handlers/inputHandler.js';
import { Player } from './player.js';
import { maps } from '../maps/index.js';
import { State } from './state.js';

export class Game {
  /**
   * @param {number} width
   * @param {number} height
   * @param {HTMLCanvasElement} canvas
   * @param {TileMap} map
   */
  constructor(width, height, canvas, map) {
    this.state = new State();
    this.state.restoreStateBackup(); // attempt to restore from backup (if any)

    this.width = width;
    this.height = height;
    this.canvas = canvas;
    this.map = this.state.mapKey ? new maps[this.state.mapKey]() : map; // restore from saved key if available
    this.player = new Player(
      this,
      true,
      this.state.player.x || null,
      this.state.player.y || null,
    );
    this.input = new InputHandler(canvas);
    this.fps = 30;
    this.frameInterval = 1000 / this.fps;
    this.lastTime = 0;
  }

  // World position of the viewport's top-left corner, keeping the player centered.
  // Math.round keeps tile draws on integer pixels, preventing sub-pixel gaps.
  get cameraX() {
    return Math.round(this.player.x - this.width / 2 + this.player.width / 2);
  }

  get cameraY() {
    return Math.round(this.player.y - this.height / 2 + this.player.height / 2);
  }

  update(deltaTime, fps) {
    if (this.state.transition) {
      this.map.portal.updateTransition(this);
      return; // block player input during transition
    }
    if (this.state.activeEvent) {
      this.state.activeEvent.dialog.update(this);
      return; // block movement during dialog
    }
    this.player.update(this.input.keys, deltaTime, fps);
    this._checkInteraction();
  }

  loadMap(mapKey) {
    if (!maps[mapKey]) throw new Error(`Unknown map: "${mapKey}"`);
    this.map = new maps[mapKey]();
    this.state.update({ player: this.player, mapKey });
  }

  _checkInteraction() {
    if (this.player.isMoving) return;
    if (!this.input.keys.includes('Enter')) return;
    this.input.consumeKey('Enter');
    const hit = this.map.eventTriggers.find((t) => t.isFacing(this.player));
    if (!hit) return;
    this.player.enableMovement = false;
    hit.dialog.reset();
    this.state.activeEvent = hit;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   */
  draw(context) {
    context.fillStyle = 'black';
    context.fillRect(0, 0, this.width, this.height);
    this.map.draw(context, this.cameraX, this.cameraY);
    this.player.draw(context);
    if (this.state.transition)
      this.map.portal.drawTransition(context, this.width, this.height, this);
    if (this.state.activeEvent)
      this.state.activeEvent.dialog.draw(context, this);
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
