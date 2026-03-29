import {
  DIALOG_CHARS_PER_FRAME,
  DIALOG_FONT,
  DIALOG_LINE_HEIGHT,
  DIALOG_MARGIN,
  DIALOG_PADDING,
} from '../constants/dialog.js';

export class Dialog {
  /**
   * @param {string[][]} pages - pages of lines: [['line1', 'line2'], ['next page']]
   */
  constructor(pages) {
    this.pages = pages;
    this.pageIndex = 0;
    this.charIndex = 0;
  }

  reset() {
    this.pageIndex = 0;
    this.charIndex = 0;
  }

  /**
   * @param {import('./game.js').Game} game
   */
  update(game) {
    const lines = this.pages[this.pageIndex];
    const totalChars = lines.reduce((sum, l) => sum + l.length, 0);

    if (this.charIndex < totalChars) {
      this.charIndex = Math.min(
        this.charIndex + DIALOG_CHARS_PER_FRAME,
        totalChars,
      );
    }

    if (game.input.keys.includes('Enter')) {
      game.input.consumeKey('Enter');
      if (this.charIndex < totalChars) {
        this.charIndex = totalChars;
      } else if (this.pageIndex < this.pages.length - 1) {
        this.pageIndex++;
        this.charIndex = 0;
      } else {
        this.close(game);
      }
    }
  }

  /**
   * @param {import('./game.js').Game} game
   */
  close(game) {
    const event = game.state.activeEvent;
    game.state.saveStateBackup({
      interactions: {
        [game.map.currentMapKey]: {
          [event.name]: { interacted: true },
        },
      },
    });
    this.reset();
    game.player.enableMovement = true;
    game.state.activeEvent = null;
  }

  /**
   * @param {CanvasRenderingContext2D} context
   * @param {import('./game.js').Game} game
   */
  draw(context, game) {
    const lines = this.pages[this.pageIndex];
    const totalChars = lines.reduce((sum, l) => sum + l.length, 0);

    const BOX_H = DIALOG_PADDING * 2 + lines.length * DIALOG_LINE_HEIGHT;
    const BOX_X = DIALOG_MARGIN;
    const BOX_Y = game.height - BOX_H - DIALOG_MARGIN;
    const BOX_W = game.width - DIALOG_MARGIN * 2;

    context.save();

    context.fillStyle = 'rgba(255,255,255,1)';
    context.strokeStyle = 'black';
    context.lineWidth = 2;
    context.beginPath();
    context.roundRect(BOX_X, BOX_Y, BOX_W, BOX_H, 6);
    context.fill();
    context.stroke();

    context.fillStyle = 'black';
    context.font = DIALOG_FONT;
    context.textBaseline = 'top';

    let charsLeft = this.charIndex;
    for (let i = 0; i < lines.length; i++) {
      if (charsLeft <= 0) break;
      const visible = lines[i].slice(0, charsLeft);
      charsLeft -= lines[i].length;
      context.fillText(
        visible,
        BOX_X + DIALOG_PADDING,
        BOX_Y + DIALOG_PADDING + i * DIALOG_LINE_HEIGHT,
      );
    }

    if (this.charIndex >= totalChars) {
      context.fillText(
        '\u25bc',
        BOX_X + BOX_W - DIALOG_PADDING - 8,
        BOX_Y + BOX_H - DIALOG_PADDING - DIALOG_LINE_HEIGHT,
      );
    }

    context.restore();
  }
}
