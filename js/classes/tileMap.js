import { SCALED_TILE_SIZE, TILE_SCALING_AMOUNT } from '../constants/tileset.js';

/**
 * TileMap handles rendering the tilemap and collision detection based on a 2D array of tile IDs.
 * @param {number[][]} mapData - 2D array of tile IDs, indexed as [row][col]
 * @param {Set<number>} solidTileIds - Set of tile IDs that are solid for collision purposes.
 * @param {number} scaledTileSize - Size of each tile on the canvas in pixels.
 * @param {number} tileScaling - Scale factor applied when drawing tiles.
 * @param {number} tilesPerSheetRow - Number of tiles per row in the tileset image.
 * @param {number} tileSize - Original tile size in the tileset image in pixels.
 * @param {HTMLImageElement} tilesetImage - The tileset image to draw tiles from.
 * @param {Portal} portal - Portal instance for map transitions.
 */
export class TileMap {
  constructor(
    mapData,
    solidTileIds,
    scaledTileSize,
    tileScaling,
    tilesPerSheetRow,
    tileSize,
    tilesetImage,
    portal,
  ) {
    this.mapData = mapData; // 2D array [row][col] of tile IDs
    this.rows = mapData.length;
    this.cols = mapData[0].length;
    this.tileset = tilesetImage;
    this.solidTileIds = solidTileIds;
    this.scaledTileSize = scaledTileSize;
    this.tilesPerSheetRow = tilesPerSheetRow;
    this.tileSize = tileSize;
    this.tileScaling = tileScaling;
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
