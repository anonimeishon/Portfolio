export const FADE_DURATION = 300;
// Camera animation is 700ms; start fade 300ms before it ends.
export const FADE_START_DELAY = 400;

export const CAMERA_BUTTON_STATE_RESET = 'reset';
export const CAMERA_BUTTON_STATE_GAME = 'GAME';
export const cameraButtonState = {
  button: null,
  cameraMode: CAMERA_BUTTON_STATE_RESET,
};
