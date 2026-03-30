import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export const testThree = ({ secondaryCanvas }) => {
  // 🎬 Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  // 📷 Camera
  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 1.2, 3);

  // 🖥️ Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // 🎮 Controls
  const controls = new OrbitControls(camera, renderer.domElement);

  // 💡 Lights
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 5, 5);
  scene.add(light);

  scene.add(new THREE.AmbientLight(0xffffff, 0.5));

  // 🎨 Canvas texture from the game's secondary canvas
  secondaryCanvas.width = 160;
  secondaryCanvas.height = 144;
  /**
   * @type {HTMLCanvasElement} theMainCanvas
   */

  // const texture = new THREE.CanvasTexture(secondaryCanvas);
  const texture = new THREE.CanvasTexture(mainCanvas);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.flipY = true;

  // CRT shader — barrel distortion + scanlines + vignette
  const crtMaterial = new THREE.ShaderMaterial({
    uniforms: { map: { value: texture } },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform sampler2D map;
      varying vec2 vUv;

      vec2 crtDistort(vec2 uv) {
        uv = uv * 2.0 - 1.0;
        float r2 = dot(uv, uv);
        uv *= 1.0 + 0.12 * r2;       // barrel curve strength — increase for more bend
        return uv * 0.5 + 0.5;
      }

      void main() {
        vec2 uv = crtDistort(vUv);

        // Discard pixels outside the curved screen edge
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
          return;
        }

        vec4 col = texture2D(map, uv);

        // Scanlines
        float scan = sin(uv.y * 144.0 * 3.14159) * 0.5 + 0.5;
        col.rgb *= mix(0.75, 1.0, scan);

        // Vignette
        vec2 vig = vUv * (1.0 - vUv.yx);
        col.rgb *= pow(vig.x * vig.y * 16.0, 0.2);

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
          crtMaterial,
          // new THREE.MeshBasicMaterial({ map: texture, transparent: true }),
        );
        plane.position.copy({
          x: child.position.x + 0.035,
          y: child.position.y - 0.4,
          z: child.position.z + 0.35,
        }); // slight offset to prevent z-fighting
        // plane.quaternion.copy(child.quaternion);
        geo.rotateX(Math.PI * 0.5); // orient flat in the XZ plane
        plane.scale.copy(child.scale);

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
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
