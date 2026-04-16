import {
  beginCameraAnimation,
  cameraBasePosition,
  cameraTarget,
  finishCameraAnimation,
  getCameraAnimationState,
} from '../components/camera/camera.js';
import { controls } from '../components/controls/controls.js';

export const animationContext = {
  controls,
  cameraBasePosition,
  cameraTarget,
  beginCameraAnimation,
  finishCameraAnimation,
  getCameraAnimationState,
};
