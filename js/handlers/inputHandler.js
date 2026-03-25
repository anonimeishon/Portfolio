const ALLOWED_KEYS = [
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
];

export class InputHandler {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.keys = [];

    canvas.addEventListener('keydown', (e) => {
      if (ALLOWED_KEYS.includes(e.key)) {
        e.preventDefault(); // stop arrow keys from scrolling the page
        if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
      }
    });

    canvas.addEventListener('keyup', (e) => {
      if (ALLOWED_KEYS.includes(e.key)) {
        this.keys.splice(this.keys.indexOf(e.key), 1);
      }
    });

    // Clear all held keys when the canvas loses focus so inputs don't get stuck
    canvas.addEventListener('blur', () => {
      this.keys = [];
    });
  }
}
