import { unlockAudio } from './classes/sounds/soundPlayer.js';
import { gltfModelLoader } from './3d/helpers/gltfLoader.js';
import { loadingManager } from './utils/loadingManager.js';

window.onload = () => {
  loadingManager.init(
    document.getElementById('loadingBar'),
    document.getElementById('startBtn'),
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

  const screen = document.getElementById('startScreen');
  screen.classList.add('start-screen--closing');
  screen.addEventListener('animationend', () => screen.remove(), {
    once: true,
  });
};

window.requestPermissions = requestPermissions;
