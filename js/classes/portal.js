/** @import { Player } from './player.js' */
/** @import { Game } from './game.js' */

export class Portal {
  /**
   *
   * @param {PortalEntry[]} portals
   * @typedef  {{ x:number, y:number, targetMap:string, targetX:number, targetY:number }} PortalEntry
   */
  constructor(portals) {
    /**
     * @type {PortalEntry[]}
     */

    this.portals = {};
    portals.forEach((portal) => {
      this.portals[`${portal.x},${portal.y}`] = portal;
    });
  }
  /**
   * @param {Player} player
   * @param {Game} game
   * @returns {void}
   */
  detectMove(player, game) {
    const portal = this.portals[`${player.x},${player.y}`];

    if (portal) {
      this._move(
        portal.targetMap,
        portal.targetX,
        portal.targetY,
        player,
        game,
      );
    }
  }
  /**
   * @param {string} targetMap
   * @param {number} targetX
   * @param {number} targetY
   * @param {Player} player
   * @param {Game} game
   */
  _move(targetMap, targetX, targetY, player, game) {
    game.loadMap(targetMap);
    player.x = targetX;
    player.y = targetY;
  }
}
