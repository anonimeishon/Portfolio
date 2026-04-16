import { Scene } from 'three';

export class SceneContext {
  /**
   * @type {Scene}
   */
  _scene = null;

  constructor() {
    this._scene = new Scene();
  }

  get scene() {
    return this._scene;
  }
}

export const sceneContext = new SceneContext();
export const scene = sceneContext.scene;
