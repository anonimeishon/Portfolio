import { loadingManager } from './loadingManager.js';

let _imageTotal = 0;
let _imageLoaded = 0;
const _onImagesProgress = loadingManager.register('images');

export class AssetLoader {
  constructor() {
    this.images = {};
  }

  loadImage(key, src) {
    // Dedup: if already loaded, return immediately without a new fetch
    if (this.images[key]) return Promise.resolve(this.images[key]);

    _imageTotal++;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        this.images[key] = img;
        _imageLoaded++;
        _onImagesProgress((_imageLoaded / _imageTotal) * 100);
        resolve(img);
      };
      img.onerror = () => {
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  async loadAll(imageList) {
    const promises = imageList.map(({ key, src }) => this.loadImage(key, src));
    await Promise.all(promises);
    return this.images;
  }

  get(key) {
    return this.images[key];
  }
}

// Shared singleton — imported by all modules that need assets.
// ES modules guarantee this is evaluated once, so all consumers
// share the same cache and images are never fetched more than once.
export const sharedLoader = new AssetLoader();
