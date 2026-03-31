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

    /**
     * @type {{ ArrowUp: HTMLDivElement, ArrowDown: HTMLDivElement, ArrowLeft: HTMLDivElement, ArrowRight: HTMLDivElement, A: HTMLDivElement, B: HTMLDivElement }}
     */
    this.virtualKeys = {
      ArrowUp: arrowKeyUp,
      ArrowDown: arrowKeyDown,
      ArrowLeft: arrowKeyLeft,
      ArrowRight: arrowKeyRight,
      A: controlKeyA,
      B: controlKeyB,
    };

    const onTouchEnd = (key) => {
      return (e) => {
        e.preventDefault();
        e.currentTarget.classList.remove('pressed');

        const idx = this.keys.indexOf(key);
        if (idx !== -1) this.keys.splice(idx, 1);
      };
    };

    for (const [key, el] of Object.entries(this.virtualKeys)) {
      el.addEventListener('touchstart', (e) => {
        el.classList.add('pressed');

        let pressedKey = key;
        if (key === 'A') pressedKey = 'Enter'; // map virtual "A" button to "Enter" key
        if (key === 'B') return; // ignore "B" button for now since it has no in-game function
        if (this.keys.indexOf(pressedKey) === -1) this.keys.push(pressedKey);
      });
      el.addEventListener('touchend', onTouchEnd(key));
      el.addEventListener('touchcancel', onTouchEnd(key));
    }
    window.addEventListener('keydown', (e) => {
      if (ALLOWED_KEYS.includes(e.key)) {
        e.preventDefault(); // stop arrow keys from scrolling the page
        if (this.keys.indexOf(e.key) === -1) this.keys.push(e.key);
      }
    });

    window.addEventListener('keyup', (e) => {
      if (ALLOWED_KEYS.includes(e.key)) {
        this.keys.splice(this.keys.indexOf(e.key), 1);
      }
    });

    // Clear all held keys when the canvas loses focus so inputs don't get stuck
    canvas.addEventListener('blur', () => {
      this.keys = [];
    });
  }

  /** Removes a key immediately — forces the user to release and re-press to trigger again. */
  consumeKey(key) {
    const idx = this.keys.indexOf(key);
    if (idx !== -1) this.keys.splice(idx, 1);
  }
}
