/**
 * @import { TileMap } from '../../classes/tileMap.js';
 */
import { Portal } from '../../classes/portal.js';
import { TileMap } from '../../classes/tileMap.js';
import { EventTrigger } from '../../classes/eventTrigger.js';
import { ASSETS_BASE } from '../../constants/assets.js';
import { TRAINER_SPRITE_SIZE } from '../../constants/player.js';
import {
  SCALED_TILE_SIZE,
  TILE_SCALING_AMOUNT,
} from '../../constants/tileset.js';
import { sharedLoader } from '../../utils/assetLoader.js';
import {
  MAP_MAIN_ROOM,
  MAP_MAIN_ROOM_SOLID_TILE_IDS,
  MAP_MAIN_ROOM_TILE_SIZE,
  MAP_MAIN_ROOM_TILES_PER_SHEET_ROW,
} from './constants.js';

await sharedLoader.loadImage(
  'tileset',
  `${ASSETS_BASE}Pokemon_RBY_Tile_Set_01.png`,
);

/**
 * @extends {TileMap}
 */
export class MainRoomMap extends TileMap {
  constructor() {
    super(
      MAP_MAIN_ROOM,
      MAP_MAIN_ROOM_SOLID_TILE_IDS,
      SCALED_TILE_SIZE,
      TILE_SCALING_AMOUNT,
      MAP_MAIN_ROOM_TILES_PER_SHEET_ROW,
      MAP_MAIN_ROOM_TILE_SIZE,
      sharedLoader.get('tileset'),
      new Portal([
        {
          targetMap: 'town',
          targetX: TRAINER_SPRITE_SIZE * 9,
          targetY: TRAINER_SPRITE_SIZE * 1,
          x: TRAINER_SPRITE_SIZE * 6,

          y: TRAINER_SPRITE_SIZE,
        },
      ]),
      'mainRoom',
      [
        new EventTrigger({
          name: 'computer',
          positions: [
            { x: TRAINER_SPRITE_SIZE * 0, y: TRAINER_SPRITE_SIZE * 1 },
          ],
          action: 'dialog',
          dialog: 'This is my computer... it is the best computer in town...',
        }),
      ],
    );
  }
}
