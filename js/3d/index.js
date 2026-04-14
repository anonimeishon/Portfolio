import { World } from './GameWorld.js';
import { GameBoy } from './GameBoy.js';
import { Button } from './Button.js';

import { resetCameraAnimation } from './helpers/resetCameraAnimation.js';
import { gameCameraAnimation } from './helpers/gameCameraAnimation.js';

let cameraMode = 'reset'; // 'game' or 'reset'
export const start3DGame = ({ renderCanvas }) => {
  const switchCameraMode = () => {
    if (cameraMode === 'game') {
      resetCameraAnimation();
      cameraMode = 'reset';
    } else {
      gameCameraAnimation();
      cameraMode = 'game';
    }
  };

  window.switchCameraMode = switchCameraMode;
  renderScreen({ renderCanvas });
};

const renderScreen = ({ renderCanvas }) => {
  const world = new World();

  world.add(new GameBoy(world));

  // world.add(
  //   new Button(world, {
  //     labelType: 'icon',
  //     iconPath: 'assets/icons/camera.svg',
  //   }),
  // );

  world.startLoop(renderCanvas);
};
