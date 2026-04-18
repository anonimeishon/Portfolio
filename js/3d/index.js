import { World } from './components/GameWorld.js';
import { GameBoy } from './components/gameboy/GameBoy.js';
import { Button } from './components/Button.js';

import { cameraButtonState } from './helpers/cameraButtonState.js';
import { switchToGame } from './helpers/switchToGame.js';
import { switchToReset } from './helpers/switchToReset.js';
import { createInstructionsText } from './components/text/instructionsText.js';
import { createInstructionsArrow } from './components/text/instructionsArrow.js';
import { createInstructionsControls } from './components/text/instructionsControls.js';
import { createModelCredits } from './components/text/gameboyCredits.js';

export const start3DGame = ({ renderCanvas }) => {
  window.switchCameraMode = () => {
    if (cameraButtonState.cameraMode === 'game') switchToReset();
    else switchToGame();
  };
  renderScreen({ renderCanvas });
};

const renderScreen = ({ renderCanvas }) => {
  const world = new World();

  world.add(new GameBoy(world));
  // world.add(createInstructionsText());
  world.add(createInstructionsArrow());
  world.add(createInstructionsControls());
  world.add(createModelCredits());
  cameraButtonState.button = new Button(world, {
    labelType: 'icon',
    iconPath: 'assets/icons/camera.svg',
  });
  world.add(cameraButtonState.button);

  world.startLoop(renderCanvas);
  // window.enterGameMode3D = () => world.enterGameMode();
  // window.exitGameMode3D = () => world.exitGameMode();
};
