/** @import { Player } from './player.js' */
/** @import { Game } from './game.js' */

const TRANSITION_STEPS = [0.2, 0.6, 1]; // alpha at each step
const FRAMES_PER_STEP = 4; // game frames to hold each step

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
      this._startTransition(
        portal.targetMap,
        portal.targetX,
        portal.targetY,
        player,
        game,
      );
    }
  }

  /**
   * @param {number} x
   * @param {number} y
   * @returns {PortalEntry | null}
   */
  getPortalAt(x, y) {
    return this.portals[`${x},${y}`] ?? null;
  }

  /**
   * Activates a portal directly by world position.
   * @param {number} x
   * @param {number} y
   * @param {Game} game
   * @returns {boolean}
   */
  activateAt(x, y, game) {
    const portal = this.getPortalAt(x, y);
    if (!portal) return false;

    this._startTransition(
      portal.targetMap,
      portal.targetX,
      portal.targetY,
      game.player,
      game,
    );
    return true;
  }

  /**
   * @param {string} mapKey
   * @param {number} targetX
   * @param {number} targetY
   * @param {Player} player
   * @param {Game} game
   */
  _startTransition(mapKey, targetX, targetY, player, game) {
    player.enableMovement = false;
    game.state.transition = {
      phase: 'fadeOut',
      stepIndex: -1,
      framesHeld: FRAMES_PER_STEP - 1, // advance on the very next frame
      mapKey,
      targetX,
      targetY,
    };
  }

  /**
   * @param {Game} game
   */
  updateTransition(game) {
    const t = game.state.transition;

    t.framesHeld++;

    if (t.framesHeld < FRAMES_PER_STEP) return;
    t.framesHeld = 0;

    if (t.phase === 'fadeOut') {
      t.stepIndex++;

      if (t.stepIndex >= TRANSITION_STEPS.length) {
        // Fully black — swap map and teleport player
        game.loadMap(t.mapKey);
        game.player.x = t.targetX;
        game.player.y = t.targetY;
        game.state.update({ player: game.player, mapKey: t.mapKey });
        game.state.transition = {
          ...t,
          stepIndex: TRANSITION_STEPS.length - 1,
          phase: 'fadeIn',
        };
      }
    } else {
      t.stepIndex--;

      if (t.stepIndex < 0) {
        game.state.transition = null; // done
        game.player.enableMovement = true;
      }
    }
  }

  get _transitionAlpha() {
    // alpha is read by drawTransition which receives game, but we use a passed-in t
    return null; // unused — see drawTransition
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {number} width
   * @param {number} height
   * @param {import('./game.js').Game} game
   */
  drawTransition(context, width, height, game) {
    const t = game.state.transition;
    if (!t) return;
    const stepIndex = Math.min(t.stepIndex, TRANSITION_STEPS.length - 1);
    const alpha = stepIndex < 0 ? 0 : TRANSITION_STEPS[stepIndex];
    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);
    context.restore();
  }
}
