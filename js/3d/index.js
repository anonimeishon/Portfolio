import { World } from './GameWorld.js';
import { GameBoy } from './GameBoy.js';

import { resetCameraAnimation } from './helpers/resetCameraAnimation.js';
import { gameCameraAnimation } from './helpers/gameCameraAnimation.js';

export const start3DGame = ({ renderCanvas }) => {
  const resetCamera = () => {
    resetCameraAnimation();
  };

  const setGameCamera = () => {
    gameCameraAnimation();
  };

  window.resetCamera = resetCamera;
  window.setGameCamera = setGameCamera;
  renderScreen({ renderCanvas });
};

const renderScreen = ({ renderCanvas }) => {
  const world = new World();

  world.add(new GameBoy(world));
  world.startLoop(renderCanvas);
};
