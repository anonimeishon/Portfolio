import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { loadingManager } from '../../../../utils/loadingManager.js';

const _loader = new FontLoader();
let _cachedFont = null;
let _loadPromise = null;

export const getPokemonFont = () => _cachedFont;

export const loadPokemonFont = () => {
  if (_loadPromise) return _loadPromise;

  const onProgress = loadingManager.register('pokemonFont');

  _loadPromise = new Promise((resolve, reject) => {
    _loader.load(
      'js/3d/components/text/fonts/typefaces/pokemon-font_Regular.json',
      (font) => {
        _cachedFont = font;
        onProgress?.(100);
        resolve(font);
      },
      (xhr) => {
        if (xhr.total > 0) onProgress?.((xhr.loaded / xhr.total) * 100);
      },
      (err) => reject(err),
    );
  });

  return _loadPromise;
};
