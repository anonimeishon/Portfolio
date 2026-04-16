import { cameraButtonState, FADE_START_DELAY } from './cameraButtonState.js';
import { gameCameraAnimation } from './gameCameraAnimation.js';
import { fadeHtmlControls } from './fade3D.js';

export const switchToGame = () => {
  gameCameraAnimation();
  cameraButtonState.cameraMode = 'game';
  setTimeout(() => {
    fadeHtmlControls(1);
  }, FADE_START_DELAY);
};
