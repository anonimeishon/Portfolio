import { cameraButtonState, FADE_START_DELAY } from './cameraButtonState.js';
import { resetCameraAnimation } from './resetCameraAnimation.js';
import { fadeHtmlControls } from './fade3D.js';

export const switchToReset = () => {
  resetCameraAnimation();
  cameraButtonState.cameraMode = 'reset';
  setTimeout(() => {
    fadeHtmlControls(0);
  }, FADE_START_DELAY);
};
