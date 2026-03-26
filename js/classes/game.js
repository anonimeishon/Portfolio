/**
 * @import {TileMap} from './tileMap.js';
 */
import { InputHandler } from '../handlers/inputHandler.js';
import { Player } from './player.js';
import { maps } from '../maps/index.js';

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
    this.player = new Player(this);
    this.input = new InputHandler(canvas);
    this.fps = 30;
    this.frameInterval = 1000 / this.fps;
    this.lastTime = 0;
  }
  update(deltaTime, fps) {
    this.player.update(this.input.keys, deltaTime, fps);
  }

  loadMap(mapKey) {
    if (!maps[mapKey]) throw new Error(`Unknown map: "${mapKey}"`);
    this.map = new maps[mapKey]();
  }

  draw(context) {
    this.map.draw(context); // draw map first — below the player
    this.player.draw(context);
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
