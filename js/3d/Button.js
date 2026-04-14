import { ASSETS_BASE } from '../constants/assets.js';
import { World } from './GameWorld.js';
import { scene } from './scene.js';
import { camera } from './camera/camera.js';
import * as THREE from 'three';

export class Button {
  /**
   * @type {scene}
   */
  _scene = null;
  /**
   * @type {THREE.MeshBasicMaterial}
   */
  material = null;

  /**
   * @type {THREE.BoxGeometry}
   */
  geometry = null;

  /**
   * @type {THREE.Mesh}
   */
  mesh = null;

  /**
   * @type {World}
   */
  _world = null;
  /**
   * @type {THREE.Sprite | null}
   */
  label = null;

  _baseY = 1.1;
  _elapsedTime = 0;
  _labelType = 'text';
  _labelText = 'START';
  _iconPath = `${ASSETS_BASE}/icons/camera.svg`;
  _anchorDistance = 2;
  _anchorMarginX = 0.15;
  _anchorMarginY = 0.15;

  _cameraRight = new THREE.Vector3();
  _cameraUp = new THREE.Vector3();
  _cameraForward = new THREE.Vector3();
  _anchorPoint = new THREE.Vector3();

  constructor(world, options = {}) {
    this._scene = scene;
    this._world = world;

    if (typeof options === 'string') {
      this._labelType = 'text';
      this._labelText = options;
    } else {
      this._labelType = options.labelType ?? 'text';
      this._labelText = options.labelText ?? 'START';
      this._iconPath = options.iconPath ?? `${ASSETS_BASE}/icons/camera.svg`;
    }

    const map = new THREE.TextureLoader().load(`${ASSETS_BASE}/button.png`);
    map.magFilter = THREE.LinearFilter;
    map.colorSpace = THREE.SRGBColorSpace;
    this.material = new THREE.MeshBasicMaterial({
      map: map,
      opacity: 1,
      depthTest: false,
      depthWrite: false,
    });
    this.geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1, 1, 1, 1);
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.renderOrder = 1000;
    this._updateScreenAnchor();
    this._baseY = this.mesh.position.y;
    this._scene.add(this.mesh);
    this._world.registerMesh(this.mesh, this);

    if (this._labelType === 'icon') {
      this._buildIconLabel(this._iconPath).then((label) => {
        if (!label) return;
        this.label = label;
        this.mesh.add(label);
        this._world.registerMesh(label, this);
      });
    } else {
      this._buildTextLabel(this._labelText).then((label) => {
        if (!label) return;
        this.label = label;
        this.mesh.add(label);
        this._world.registerMesh(label, this);
      });
    }
  }

  _updateScreenAnchor() {
    const distance = this._anchorDistance;
    const halfHeight =
      Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2) * distance;
    const halfWidth = halfHeight * camera.aspect;

    const offsetRight = halfWidth - this._anchorMarginX;
    const offsetUp = halfHeight - this._anchorMarginY;

    camera.getWorldDirection(this._cameraForward);
    this._cameraForward.normalize();

    this._cameraRight
      .set(1, 0, 0)
      .applyQuaternion(camera.quaternion)
      .normalize();
    this._cameraUp.set(0, 1, 0).applyQuaternion(camera.quaternion).normalize();

    this._anchorPoint
      .copy(camera.position)
      .addScaledVector(this._cameraForward, distance)
      .addScaledVector(this._cameraRight, offsetRight)
      .addScaledVector(this._cameraUp, -offsetUp);

    this.mesh.position.copy(this._anchorPoint);
  }

  async _buildTextLabel(labelText) {
    await document.fonts.load('bold 48px Pokemon');

    const canvas = document.createElement('canvas');
    const fontSize = 24;
    const padding = 24;

    // Measure text width with the loaded font
    const tmpCtx = canvas.getContext('2d');
    canvas.height = fontSize + padding * 2;
    tmpCtx.font = `bold ${fontSize}px Pokemon`;
    canvas.width = Math.ceil(tmpCtx.measureText(labelText).width) + padding * 2;

    // Re-apply context state after canvas resize (resize clears state)
    const ctx = canvas.getContext('2d');
    ctx.font = `bold ${fontSize}px Pokemon`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#ffffff';
    ctx.fillStyle = '#111111';
    ctx.strokeText(labelText, canvas.width / 2, canvas.height / 2);
    ctx.fillText(labelText, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const label = new THREE.Sprite(material);
    // Derive sprite width from canvas aspect ratio so nothing is ever cropped
    const spriteHeight = 0.16;
    const spriteWidth = spriteHeight * (canvas.width / canvas.height);
    label.scale.set(spriteWidth, spriteHeight, 1);
    label.position.set(0, 0, 0.21);
    return label;
  }

  async _buildIconLabel(iconPath) {
    const image = await this._loadImage(iconPath);
    if (!image) return null;

    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a white outline by stamping a white-tinted icon around the center,
    // then draw the original icon on top.
    const iconMaskCanvas = document.createElement('canvas');
    iconMaskCanvas.width = canvas.width;
    iconMaskCanvas.height = canvas.height;
    const iconMaskCtx = iconMaskCanvas.getContext('2d');
    if (!iconMaskCtx) return null;
    iconMaskCtx.clearRect(0, 0, iconMaskCanvas.width, iconMaskCanvas.height);
    iconMaskCtx.drawImage(
      image,
      0,
      64,
      iconMaskCanvas.width / 2,
      iconMaskCanvas.height / 2,
    );
    iconMaskCtx.globalCompositeOperation = 'source-in';
    iconMaskCtx.fillStyle = '#ffffff';
    iconMaskCtx.fillRect(0, 0, iconMaskCanvas.width, iconMaskCanvas.height);
    iconMaskCtx.globalCompositeOperation = 'source-over';

    const outlineRadius = 5;
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
      const dx = Math.round(Math.cos(angle) * outlineRadius);
      const dy = Math.round(Math.sin(angle) * outlineRadius);
      ctx.drawImage(iconMaskCanvas, dx, dy, canvas.width, canvas.height);
    }

    ctx.drawImage(image, 0, 64, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;

    const material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });

    const label = new THREE.Sprite(material);
    label.renderOrder = 1001;
    label.scale.set(0.14, 0.14, 1);
    label.position.set(0.1, 0, 0);
    return label;
  }

  _loadImage(src) {
    return new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => resolve(null);
      image.src = src;
    });
  }

  hit(e) {
    window.switchCameraMode();
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this.mesh.rotation.x += Math.PI / 8;
        this.mesh.rotation.y += Math.PI / 8;
      }, i * 50);
    }
  }
  resolveKey() {
    return;
  }
  onFrame(deltaSeconds) {
    this._elapsedTime += deltaSeconds;
    this._updateScreenAnchor();
    this._baseY = this.mesh.position.y;
    this.mesh.position.y = this._baseY + Math.sin(this._elapsedTime * 2) * 0.01;
  }
}
