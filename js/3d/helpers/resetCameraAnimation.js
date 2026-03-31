import { RESET_CAMERA_ANIMATION } from '../../constants/three.js';
import { animateCamera } from './animateCamera.js';
import { animationContext } from './animationContext.js';
import { enableMovement } from './cursorController.js';
import { enablePhoneMotion } from './phoneMotionController.js';

export const resetCameraAnimation = () => {
  enableMovement();
  enablePhoneMotion();
  animateCamera({
    ...RESET_CAMERA_ANIMATION,
    ...animationContext,
  });
};
