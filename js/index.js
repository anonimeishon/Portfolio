import { unlockAudio } from './classes/sounds/soundPlayer.js';
import { setupCameraOrbitButton } from './utils/cameraOrbitButton.js';
import { preloadGames, startGames } from './utils/gameBootstrap.js';
import { loadingManager } from './utils/loadingManager.js';
import { closeStartScreen } from './utils/startScreen.js';

let startScreenElement = null;
let mainCanvasElement = null;
let renderCanvasElement = null;

// Module promises kicked off at window.onload so asset loading begins immediately.
// requestPermissions awaits these — by then the assets may already be ready.
let _preloadedGames = null;

window.onload = () => {
  startScreenElement = document.getElementById('startScreen');
  mainCanvasElement = document.getElementById('mainCanvas');
  renderCanvasElement = document.getElementById('renderCanvas');

  setupCameraOrbitButton();
  loadingManager.init(
    startScreenElement,
    document.getElementById('loadingBarContainer'),
    document.getElementById('loadingBar'),
    document.getElementById('startBtn'),
    document.getElementById('loadingText'),
  );

  // Start loading all assets immediately — no user interaction required.
  // The dynamic imports trigger top-level awaits in the module graph
  // (tileset, trainer sprite) so images load in parallel with the GLTF model.
  _preloadedGames = preloadGames();
};

const requestPermissions = async () => {
  // iOS Safari: requestPermission MUST be called synchronously within the user
  // gesture handler — any await before it breaks the activation context and the
  // prompt will never appear. Start the request now, await the result later.
  const motionPermissionPromise =
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
      ? DeviceMotionEvent.requestPermission()
      : null;

  await unlockAudio();

  if (motionPermissionPromise) {
    try {
      await motionPermissionPromise;
      // Once granted, iOS delivers devicemotion events to the listener that
      // phoneMotionController registered at init time — no re-registration needed.
    } catch (error) {}
  }

  // Await the pre-loaded modules. If assets finished loading before the user
  // clicked start, these resolve instantly; otherwise they wait for the remainder.
  if (!_preloadedGames) {
    _preloadedGames = preloadGames();
  }

  await startGames(_preloadedGames, {
    mainCanvas: mainCanvasElement,
    renderCanvas: renderCanvasElement,
  });

  closeStartScreen(startScreenElement);
};

window.requestPermissions = requestPermissions;
