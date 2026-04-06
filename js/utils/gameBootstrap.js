import { gltfModelLoader } from '../3d/helpers/gltfLoader.js';

export const preloadGames = () => {
  gltfModelLoader.instance.loadModel('gameboy');

  return {
    gameEnginePromise: import('../startGameEngine.js'),
    threeDGamePromise: import('../3d/index.js'),
  };
};

export const startGames = async (
  { gameEnginePromise, threeDGamePromise },
  { mainCanvas, renderCanvas },
) => {
  const [{ startGameEngine }, { start3DGame }] = await Promise.all([
    gameEnginePromise,
    threeDGamePromise,
  ]);

  startGameEngine(mainCanvas);
  start3DGame({ renderCanvas });
};
