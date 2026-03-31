import { renderScreen } from './3d/index.js';
import { resetCameraAnimation } from './3d/helpers/resetCameraAnimation.js';
import { gameCameraAnimation } from './3d/helpers/gameCameraAnimation.js';
import { startGame } from './startGame.js';
import { motion } from './3d/helpers/phoneMotionController.js';

const renderMotionDebug = () => {
  const motionDebugEl = document.getElementById('motionDebugger');
  if (motionDebugEl) {
    motionDebugEl.innerText = `Motion: x=${(motion.x ?? 0).toFixed(2)}, y=${(motion.y ?? 0).toFixed(2)}, z=${(motion.z ?? 0).toFixed(2)}`;
  }
  requestAnimationFrame(renderMotionDebug);
};

window.onload = () => {
  // startGame();
  startGame(mainCanvas);
  renderScreen({ renderCanvas });
  window.globalThis.motionValues = motion;
  renderMotionDebug();
};

export const resetCamera = () => {
  resetCameraAnimation();
};

export const setGameCamera = () => {
  gameCameraAnimation();
};

window.resetCamera = resetCamera;
window.setGameCamera = setGameCamera;
console.log(resetCamera);
