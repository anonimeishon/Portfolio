import { SCALED_TILE_SIZE, TILE_SCALING_AMOUNT } from '../constants/tileset.js';

/**
 * TileMap handles rendering the tilemap and collision detection based on a 2D array of tile IDs.
 * @param {number[][]} mapData - 2D array of tile IDs, indexed as [row][col]
 * Each tile ID corresponds to a specific tile in the tileset image, and determines if it's solid or not.
 * @param {Set<number>} solidTileIds - Set of tile IDs that should be treated as solid for collision purposes.
 * Tiles that are not in the solidTileIds set will be treated as passable.
 * @param {number} scaledTileSize - The size of each tile when drawn on the canvas, in pixels (e.g. 16 for 16x16 tiles).
 * @param {number} tileScaling - The factor by which the original tile size is scaled when drawn (e.g. 2 for 16x16 tiles drawn as 32x32).
 * @param {number} tilesPerSheetRow - The number of tiles in each row of the tileset image, used to calculate source coordinates.
 * @param {number} tileSize - The original size of each tile in the tileset image, in pixels (e.g. 8 for 8x8 tiles).
 * @param {AssetLoader} loader - The asset loader instance used to load and retrieve assets like the tileset image.
 * @param {Portal} portal - An optional Portal instance that defines areas of the map that trigger transitions to other maps.
 */
export class TileMap {
  constructor(
    mapData,
    solidTileIds,
    scaledTileSize,
    tileScaling,
    tilesPerSheetRow,
    tileSize,
    loader,
    portal,
  ) {
    this.mapData = mapData; // 2D array [row][col] of tile IDs
    this.rows = mapData.length;
    this.cols = mapData[0].length;
    this.tileset = loader.get('tileset');
    this.solidTileIds = solidTileIds;
    this.scaledTileSize = scaledTileSize;
    this.tilesPerSheetRow = tilesPerSheetRow;
    this.tileSize = tileSize;
    this.tileScaling = tileScaling;
    this.loader = loader;
    this.portal = portal;
  }

  // Returns true if the world-space bounding box overlaps any solid tile.
  // worldX/worldY is the top-left corner; width/height is the bounding box size.
  isSolid(worldX, worldY, width, height) {
    const tileLeft = Math.floor(worldX / this.scaledTileSize);

    const tileTop = Math.floor(worldY / this.scaledTileSize);
    const tileRight = Math.floor((worldX + width - 1) / this.scaledTileSize);

    const tileBottom = Math.floor((worldY + height - 1) / this.scaledTileSize);

    for (let r = tileTop; r <= tileBottom; r++) {
      for (let c = tileLeft; c <= tileRight; c++) {
        // Treat out-of-bounds as solid
        if (r < 0 || c < 0 || r >= this.rows || c >= this.cols) return true;
        if (this.solidTileIds.has(this.mapData[r][c])) return true;
      }
    }
    return false;
  }

  /**
   *
   * @param {CanvasRenderingContext2D} context
   * @param {number} tilesPerSheetRow
   * @param {number} tileSize
   * @param {number} tileScaling
   */
  draw(context) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        context.save();
        context.scale(
          this.tileScaling, //because trainer takes up 2 horizontal tiles
          this.tileScaling, //because trainer takes up 2 vertical tiles
        );
        const tileId = this.mapData[r][c];
        const srcX = (tileId % this.tilesPerSheetRow) * this.tileSize;
        const srcY = Math.floor(tileId / this.tilesPerSheetRow) * this.tileSize;
        context.drawImage(
          this.tileset,
          srcX,
          srcY,
          this.tileSize,
          this.tileSize,
          c * this.tileSize,
          r * this.tileSize,
          this.tileSize,
          this.tileSize,
        );

        // // Draw tile ID label
        // context.font = `${this.tileSize * 0.6}px monospace`;
        // context.fillStyle = 'cyan';
        // context.lineWidth = 1.5 / this.tileScaling;
        // context.strokeStyle = 'black';
        // const label = String(tileId);
        // const labelX = c * this.tileSize + this.tileSize / 2;
        // const labelY = r * this.tileSize + this.tileSize * 0.7;
        // context.textAlign = 'center';
        // context.strokeText(label, labelX, labelY);
        // context.fillText(label, labelX, labelY);

        context.restore();
      }
    }
  }
}
