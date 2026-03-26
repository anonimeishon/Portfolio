/**
 * @import { TileMap } from '../../classes/tileMap.js';
 */
import { Portal } from '../../classes/portal.js';
import { TileMap } from '../../classes/tileMap.js';
import { ASSETS_BASE } from '../../constants/assets.js';
import { TRAINER_SPRITE_SIZE } from '../../constants/player.js';
import {
  SCALED_TILE_SIZE,
  TILE_SCALING_AMOUNT,
} from '../../constants/tileset.js';
import { sharedLoader } from '../../utils/assetLoader.js';
import {
  MAP_MAIN_TOWN,
  MAP_MAIN_TOWN_SOLID_TILE_IDS,
  MAP_MAIN_TOWN_TILE_SIZE,
  MAP_MAIN_TOWN_TILES_PER_SHEET_ROW,
} from './constants.js';

await sharedLoader.loadImage(
  'tileset',
  `${ASSETS_BASE}Pokemon_RBY_Tile_Set_01.png`,
);

/**
 * @extends {TileMap}
 */
export class TownMap extends TileMap {
  constructor() {
    super(
      MAP_MAIN_TOWN,
      MAP_MAIN_TOWN_SOLID_TILE_IDS,
      SCALED_TILE_SIZE,
      TILE_SCALING_AMOUNT,
      MAP_MAIN_TOWN_TILES_PER_SHEET_ROW,
      MAP_MAIN_TOWN_TILE_SIZE,
      sharedLoader.get('tileset'),
      new Portal([
        {
          targetMap: 'mainRoom',
          targetX: TRAINER_SPRITE_SIZE * 5,
          targetY: TRAINER_SPRITE_SIZE * 1,
          x: TRAINER_SPRITE_SIZE * 6,

          y: TRAINER_SPRITE_SIZE,
        },
      ]),
    );
  }
}
