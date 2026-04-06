import { unlockAudio } from './classes/sounds/soundPlayer.js';
import { gltfModelLoader } from './3d/helpers/gltfLoader.js';
import { loadingManager } from './utils/loadingManager.js';

let startScreenElement = null;

window.onload = () => {
  startScreenElement = document.getElementById('startScreen');
  loadingManager.init(
    startScreenElement,
    document.getElementById('loadingBarContainer'),
    document.getElementById('loadingBar'),
    document.getElementById('startBtn'),
    document.getElementById('loadingText'),
  );

  gltfModelLoader.instance.loadModel('gameboy');
};

const requestPermissions = async () => {
  await unlockAudio();

  if (
    typeof DeviceMotionEvent !== 'undefined' &&
    typeof DeviceMotionEvent.requestPermission === 'function'
  ) {
    try {
      const response = await DeviceMotionEvent.requestPermission();

      if (response === 'granted') {
        window.resetCamera = resetCamera;
        window.setGameCamera = setGameCamera;
      }
    } catch (error) {}
  }

  // Start the game immediately so it renders underneath the closing animation.
  const { startGameEngine } = await import('./startGameEngine.js');
  startGameEngine(mainCanvas);
  const { start3DGame } = await import('./3d/index.js');

  start3DGame({ renderCanvas });

  startScreenElement.classList.add('start-screen-closing');
  startScreenElement.addEventListener(
    'animationend',
    () => {
      return startScreenElement.remove();
    },
    {
      once: true,
    },
  );
};

window.requestPermissions = requestPermissions;
