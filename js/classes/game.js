/**
 * @import {TileMap} from './tileMap.js';
 */
import { InputHandler } from '../handlers/inputHandler.js';
import { Player } from './player.js';
import { maps } from '../maps/index.js';
import { State } from './state.js';
import { Menu } from './menu.js';
import { EventTrigger } from './eventTrigger.js';
import { sfxPlayer } from './sounds/sfxPlayer.js';
import {
  LINK_GITHUB,
  LINK_LINKEDIN,
  LINK_CONTACT,
} from '../constants/links.js';

export class Game {
  /**
   * @type {Object.<string, EventTrigger>}
   */
  globalEventTriggers = {};

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
      this.state.player.x ?? null,
      this.state.player.y ?? null,
      this.state.player.direction,
    );
    this.map.attachNpcsToGame(this);

    this.globalEventTriggers.showCredits = new EventTrigger({
      name: 'credits',
      positions: [], // not used since we'll trigger this manually from the menu
      action: 'dialog',

      dialog:
        '"Game Boy Color" by Wikiti (Sketchfab, CC BY 4.0)\nSFX created with ChipTone (SFB Games)\n\nFont: “pokemon-font” by cooljeanius (OFL 1.1) \nhttps://github.com/\ncooljeanius/\npokemon-font',
    });

    this.input = InputHandler.init();
    this.sfxPlayer = sfxPlayer;
    this.menu = new Menu([
      { label: 'CAMERA', action: () => window.switchCameraMode?.() },
      {
        label: 'CREDIT',
        action: () =>
          (this.state.activeEvent = this.globalEventTriggers.showCredits),
      },
      {
        label: 'MUTE',
        action: () =>
          this.sfxPlayer.isMuted
            ? this.sfxPlayer.unmute()
            : this.sfxPlayer.mute(),
      },
      {
        label: 'FLSCRN',
        action: () => window.toggleFullscreen?.(),
      },
      {
        label: 'GITHUB',
        action: () => window.open(LINK_GITHUB, '_blank', 'noopener,noreferrer'),
      },
      {
        label: 'LNKDIN',
        action: () =>
          window.open(LINK_LINKEDIN, '_blank', 'noopener,noreferrer'),
      },
      {
        label: 'CONTCT',
        action: () =>
          window.open(LINK_CONTACT, '_blank', 'noopener,noreferrer'),
      },
    ]);
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

  _toWorldPosition(canvasX, canvasY) {
    return {
      worldX: this.cameraX + canvasX,
      worldY: this.cameraY + canvasY,
    };
  }

  _snapToGrid(worldX, worldY) {
    const step = this.player.width;
    return {
      tileX: Math.floor(worldX / step) * step,
      tileY: Math.floor(worldY / step) * step,
    };
  }

  _activateEvent(eventTrigger) {
    this.player.enableMovement = false;
    eventTrigger.dialog.reset();
    this.state.activeEvent = eventTrigger;
  }

  handleScreenClick(canvasX, canvasY) {
    if (this.state.transition || this.menu.isOpen) return false;

    if (this.state.activeEvent) {
      this.state.activeEvent.dialog.advance(this);
      return true;
    }

    const { worldX, worldY } = this._toWorldPosition(canvasX, canvasY);
    const { tileX, tileY } = this._snapToGrid(worldX, worldY);

    const npc = this.map.getNpcAt(tileX, tileY);
    if (npc) {
      this._activateEvent(npc);
      npc._faceToward(this.player.x, this.player.y);
      return true;
    }

    const trigger = this.map.getEventTriggerAt(tileX, tileY);
    if (trigger) {
      this._activateEvent(trigger);
      return true;
    }

    if (this.map.portal.activateAt(tileX, tileY, this)) {
      return true;
    }

    return false;
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
    // Toggle menu on p or Start
    if (this.input.keys.includes('p') || this.input.keys.includes('Start')) {
      if (!this.menu.isOpen) {
        this.input.consumeKey('p');
        this.input.consumeKey('Start');
        this.menu.open();
        return;
      }
    }
    if (this.menu.isOpen) {
      this.menu.update(this);
      return; // block player movement while menu is open
    }

    const hasMovementInput =
      this.input.keys.includes('ArrowUp') ||
      this.input.keys.includes('ArrowDown') ||
      this.input.keys.includes('ArrowLeft') ||
      this.input.keys.includes('ArrowRight');

    this.map.update(deltaTime, fps);
    this.player.update(this.input.keys, deltaTime, fps);
    this._checkInteraction();
  }

  loadMap(mapKey) {
    if (!maps[mapKey]) throw new Error(`Unknown map: "${mapKey}"`);
    this.map = new maps[mapKey]();
    this.map.attachNpcsToGame(this);
    this.state.update({ player: this.player, mapKey });
  }

  _checkInteraction() {
    if (this.player.isMoving) return;
    if (!this.input.keys.includes('Enter')) return;
    this.input.consumeKey('Enter');
    const hit = this.map.getInteractionTarget(this.player);
    if (!hit) return;
    this._activateEvent(hit);
    // Make NPCs face the player when dialog starts
    if (hit._faceToward) {
      hit._faceToward(this.player.x, this.player.y);
    }
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
    this.menu.draw(context, this);
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
