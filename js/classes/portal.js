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
    this.portals = portals;
  }
  /**
   * @param {Player} player
   * @param {Game} game
   * @returns {void}
   */
  detectMove(player, game) {
    const portal = this.portals.find(
      (p) => p.x === player.x && p.y === player.y,
    );

    if (portal) {
      this.move(portal.targetMap, portal.targetX, portal.targetY, player, game);
    }
  }
  /**
   * @param {string} targetMap
   * @param {number} targetX
   * @param {number} targetY
   * @param {Player} player
   * @param {Game} game
   */
  move(targetMap, targetX, targetY, player, game) {
    game.loadMap(targetMap);
    player.x = targetX;
    player.y = targetY;
  }
}
