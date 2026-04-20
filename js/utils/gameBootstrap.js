import { gltfModelLoader } from '../3d/helpers/gltfLoader.js';
import { loadingManager } from './loadingManager.js';

const _preloadFont = () => {
  const onProgress = loadingManager.register('pokemonFont');
  document.fonts.load('64px Pokemon').then(() => onProgress?.(100));
};

const _preloadButtonAssets = () =>
  import('../3d/components/Button.js').then(({ preloadButtonAssets }) =>
    preloadButtonAssets('assets/icons/camera.svg'),
  );

export const preloadGames = () => {
  _preloadFont();
  _preloadButtonAssets();
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

  const game = startGameEngine(mainCanvas);
  start3DGame({ renderCanvas, game });
};
