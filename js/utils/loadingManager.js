/** @type {HTMLElement | null} */
let _barEl = null;
/** @type {HTMLElement | null} */
let _btnEl = null;
/** @type {Record<string, number>} source name → progress 0–100 */
const _sources = {};
let _domBound = false;

const _flush = () => {
  const values = Object.values(_sources);
  if (!values.length) return;
  const pct = values.reduce((a, b) => a + b, 0) / values.length;
  if (_barEl) _barEl.style.width = `${pct}%`;
  if (pct >= 100 && _btnEl) _btnEl.hidden = false;
};

const _update = (name, pct) => {
  _sources[name] = Math.min(100, pct);
  if (_domBound) _flush();
};

export const loadingManager = {
  /**
   * Register a named loading source. Returns an onProgress(pct: 0–100) callback.
   * Safe to call before init() — updates are buffered and flushed when the DOM binds.
   * @param {string} name
   * @returns {(pct: number) => void}
   */
  register(name) {
    _sources[name] = 0;
    return (pct) => _update(name, pct);
  },

  /**
   * Bind the DOM elements. Immediately flushes current buffered progress.
   * @param {HTMLElement} barEl
   * @param {HTMLElement} btnEl
   */
  init(barEl, btnEl) {
    _barEl = barEl;
    _btnEl = btnEl;
    _domBound = true;
    _flush();
  },
};
