import { FADE_DURATION } from './cameraButtonState.js';

export const fadeHtmlControls = (targetOpacity, onComplete) => {
  const htmlControls = document.getElementById('htmlCameraControls');
  if (!htmlControls) {
    onComplete?.();
    return;
  }
  const start = Date.now();
  const from = targetOpacity === 0 ? 1 : 0;
  if (targetOpacity !== 0) htmlControls.style.display = 'flex';
  const tick = () => {
    const p = Math.min((Date.now() - start) / FADE_DURATION, 1);
    const opacity = from + (targetOpacity - from) * p;
    htmlControls.style.opacity = String(opacity);
    if (p < 1) requestAnimationFrame(tick);
    else {
      if (targetOpacity === 0) htmlControls.style.display = 'none';
      onComplete?.();
    }
  };
  requestAnimationFrame(tick);
};
