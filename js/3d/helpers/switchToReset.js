import { cameraButtonState, FADE_START_DELAY } from './cameraButtonState.js';
import { resetCameraAnimation } from './resetCameraAnimation.js';
import { fadeHtmlControls } from './fade3D.js';

export const switchToReset = () => {
  // Exit game mode before the reset animation so all 3D work resumes.
  // window.exitGameMode3D?.();
  resetCameraAnimation();
  cameraButtonState.cameraMode = 'reset';
  setTimeout(() => {
    fadeHtmlControls(0);
  }, FADE_START_DELAY);
};
