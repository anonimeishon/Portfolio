import { TILE_SIZE } from './game.js';
import { TRAINER_SPRITE_SIZE } from './player.js';

export const TILE_SCALING_AMOUNT = TRAINER_SPRITE_SIZE / TILE_SIZE / 2;
export const SCALED_TILE_SIZE = TILE_SIZE * TILE_SCALING_AMOUNT;
