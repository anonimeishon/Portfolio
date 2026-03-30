import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from './constants/game.js';

export const camera = new THREE.PerspectiveCamera(
  60,
  secondaryCanvas.clientWidth / secondaryCanvas.clientHeight,
  0.1,
  10,
);

// 🎬 Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 📷 Camera
camera.position.set(-0.8, 0.4, 1.5);
camera.lookAt(0, 0, 0);
// 🖥️ Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: secondaryCanvas,
  antialias: true,
});
// false = don't override the CSS size set by the layout
renderer.setSize(
  secondaryCanvas.clientWidth,
  secondaryCanvas.clientHeight,
  false,
);

// 🎮 Controls
export let controls = new OrbitControls(camera, renderer.domElement);

// 💡 Lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
export const testThree = ({ secondaryCanvas }) => {
  // 🎨 Canvas texture from the game's secondary canvas
  // secondaryCanvas.width = 160;
  // secondaryCanvas.height = 144;
  /**
   * @type {HTMLCanvasElement} theMainCanvas
   */

  // const texture = new THREE.CanvasTexture(secondaryCanvas);
  const texture = new THREE.CanvasTexture(mainCanvas);

  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  // texture.flipY = true;

  // Game Boy Color LCD pixel grid shader.
  // Each GBC pixel is rendered as a near-full square with a thin dark border,
  // matching the look of the actual LCD panel — no circles.
  const dotMatrixMaterial = new THREE.ShaderMaterial({
    uniforms: {
      map: { value: texture },
      // resolution: { value: new THREE.Vector2(160, 144) }, // GBC native resolution
      resolution: {
        value: new THREE.Vector2(CANVAS_WIDTH, CANVAS_HEIGHT),
      }, // GBC native resolution
      gapSize: { value: 0.1 }, // fraction of a cell used for the border (0.03–0.1)
      gapBrightness: { value: 0.2 }, // gap colour as a fraction of pixel brightness
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      uniform vec2 resolution;
      uniform float gapSize;
      uniform float gapBrightness;
      varying vec2 vUv;

      void main() {
        vec2 cell = vUv * resolution;
        vec2 cellIndex = floor(cell);
        vec2 cellPos = fract(cell); // 0→1 within each pixel cell

        // How many screen pixels does one cell span?
        // When < ~2px the grid becomes sub-pixel noise — fade it out.
        vec2 cellSizePx = vec2(dFdx(cell.x), dFdy(cell.y));
        float cellPx = max(abs(cellSizePx.x), abs(cellSizePx.y)); // reciprocal = px per cell
        // gridStrength → 1 when cell is ≥ 4 screen-px wide, 0 when ≤ 1.5 px wide
        float gridStrength = smoothstep(1.5, 4.0, 1.0 / cellPx);

        // Sample the colour at the centre of this pixel cell
        vec2 sampleUv = (cellIndex + 0.5) / resolution;
        vec4 col = texture2D(map, sampleUv);

        // Square pixel mask with anti-aliased edges.
        // Only computed when the grid is actually visible (avoids Moiré when zoomed out).
        float hw = gapSize * 0.5;
        float ex = fwidth(cellPos.x);
        float ey = fwidth(cellPos.y);
        float maskX = smoothstep(hw - ex, hw + ex, cellPos.x) *
                      smoothstep(hw - ex, hw + ex, 1.0 - cellPos.x);
        float maskY = smoothstep(hw - ey, hw + ey, cellPos.y) *
                      smoothstep(hw - ey, hw + ey, 1.0 - cellPos.y);
        float mask = mix(1.0, maskX * maskY, gridStrength);

        // Border shows a very dark tint of the pixel colour (LCD bleed)
        col.rgb = mix(col.rgb * gapBrightness, col.rgb, mask);

        // Subtle vignette at screen edges
        vec2 vig = vUv * (1.0 - vUv.yx);
        col.rgb *= pow(clamp(vig.x * vig.y * 15.0, 0.0, 1.0), 0.18);

        gl_FragColor = col;
      }
    `,
  });

  // 📦 Load model
  const loader = new GLTFLoader();

  let screenMesh = null;

  loader.load('./assets/models/game_boy_color.glb', (gltf) => {
    const model = gltf.scene;

    // Adjust if needed
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);

    model.traverse((child) => {
      if (child.isMesh && child.parent?.name === 'Screen') {
        // Hide the original atlas-mapped mesh
        child.visible = false;

        // Build a replacement plane as a child of the same "Screen" Object3D
        // so it inherits the exact world transform. PlaneGeometry has clean 0→1 UVs.
        const screenParent = child.parent; // the "Screen" Object3D

        // Match the original mesh's local transform so it sits flush on the screen.
        const geo = new THREE.PlaneGeometry(1, 1);
        const plane = new THREE.Mesh(
          geo,
          dotMatrixMaterial,
          // new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
        );
        plane.position.copy({
          x: child.position.x + 0.035,
          y: child.position.y - 0.4,
          z: child.position.z + 0.3,
        }); // slight offset to prevent z-fighting
        // plane.quaternion.copy(child.quaternion);
        geo.rotateX(Math.PI * 0.5); // orient flat in the XZ plane
        plane.scale.copy({
          x: child.scale.x + 0.2,
          y: child.scale.y,
          z: child.scale.z + 0.1,
        });

        screenParent.add(plane);
        screenMesh = plane;

        console.log('[Screen] injected CRT plane at', plane.position);
      }
    });

    scene.add(model);
  });

  // 🔄 Animation loop
  function animate() {
    requestAnimationFrame(animate);

    texture.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // 📱 Resize handling
  window.addEventListener('resize', () => {
    camera.aspect = secondaryCanvas.clientWidth / secondaryCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      secondaryCanvas.clientWidth,
      secondaryCanvas.clientHeight,
      false,
    );
  });
};
