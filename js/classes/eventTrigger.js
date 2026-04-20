import { Dialog } from './dialog.js';

export class EventTrigger {
  /**
   * @param {object} options
   * @param {string} options.name - unique identifier within the map
   * @param {{ x: number, y: number }[]} options.positions - world-space positions that activate this trigger
   * @param {'dialog'} options.action
   * @param {string} options.dialog - dialog text
   */
  constructor({ name, positions, action, dialog = '' }) {
    this.name = name;
    this.action = action;
    this.dialog = new Dialog(dialog);
    this._triggers = {};
    positions.forEach(({ x, y }) => {
      this._triggers[`${x},${y}`] = true;
    });
  }

  /**
   * Returns true if the player is facing one of this trigger's positions.
   * @param {import('./player.js').Player} player
   */
  isFacing(player) {
    return !!this._triggers[`${player.facingX},${player.facingY}`];
  }

  /**
   * Returns true if this trigger occupies the given world position.
   * @param {number} x
   * @param {number} y
   */
  hasPosition(x, y) {
    return !!this._triggers[`${x},${y}`];
  }
}
