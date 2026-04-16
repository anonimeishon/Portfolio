import { gltfModelLoader } from '../3d/helpers/gltfLoader.js';
import { loadingManager } from './loadingManager.js';
import { preloadButtonAssets } from '../3d/components/Button.js';

const _preloadPokemonCssFont = () => {
  const onProgress = loadingManager.register('pokemonFont');
  document.fonts.load(`64px Pokemon`).then(() => onProgress?.(100));
};

export const preloadGames = () => {
  gltfModelLoader.instance.loadModel('gameboy');
  _preloadPokemonCssFont();
  preloadButtonAssets('assets/icons/camera.svg');

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
