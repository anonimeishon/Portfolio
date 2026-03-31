import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { particles } from './geometry/particles.js';
import {
  camera,
  cameraBasePosition,
  cameraTarget,
  getCameraAnimationState,
} from './camera/camera.js';
import { scene } from './scene.js';
import { controls } from './controls/controls.js';
import { cursor } from './helpers/cursorController.js';
import { motion, isMotionEnabled } from './helpers/phoneMotionController.js';
import { renderer } from './renderer/renderer.js';
import { directionalLight } from './light/directionalLight.js';
import { ambientLight } from './light/ambientLight.js';
import { canvasTexture } from './textures/canvasTexture.js';
import { dotMatrixMaterialBuilder } from './materials/dotMatrix.js';

// 🎬 Scene
scene.background = new THREE.Color(0x000000);

// 💡 Lights

scene.add(directionalLight);

scene.add(ambientLight);

// Particles
scene.add(particles);

const motionBaseline = { x: 0, y: 0 };
let hasMotionBaseline = false;

const dotMatrixMaterial = dotMatrixMaterialBuilder(canvasTexture);
export const renderScreen = ({ renderCanvas }) => {
  // 📦 Load model
  const loader = new GLTFLoader();

  loader.load('./assets/models/GBC.glb', (gltf) => {
    const model = gltf.scene;

    // Adjust if needed
    model.scale.set(1, 1, 1);
    model.position.set(0, 0, 0);

    model.traverse((child) => {
      console.log('🚀 ~ index.js:48 ~ renderScreen ~ child.name:', child.name);
      const children = child.children.map((child) => child.name);
      if (children?.length) {
        console.log(
          '🚀 ~ index.js:52 ~ renderScreen ~ child.children.name:',
          children,
        );
      }

      if (child?.parent?.name) {
        console.log(
          '🚀 ~ index.js:59 ~ renderScreen ~ parent.name:',
          child?.parent?.name,
        );
      }

      console.log('================================');
      if (child.isMesh && child.parent?.name === 'Screen') {
        // Hide the original atlas-mapped mesh
        // child.visible = false;

        // Build a replacement plane as a child of the same "Screen" Object3D
        // so it inherits the exact world transform. PlaneGeometry has clean 0→1 UVs.
        const screenParent = child.parent; // the "Screen" Object3D

        // Match the original mesh's local transform so it sits flush on the screen.
        const geo = new THREE.PlaneGeometry(1, 1);
        const plane = new THREE.Mesh(geo, dotMatrixMaterial);

        /**
         * With this position config
         * and setting child.visible = false, the screen will not get rendered
         * which means there will be more space for the canvas texture
         */

        // child.visible = false;

        //  plane.position.copy({
        //   x: child.position.x + 0.035,
        //   y: child.position.y - 0.4,
        //   z: child.position.z + 0.3,
        // }); // slight offset to prevent z-fighting
        // // plane.quaternion.copy(child.quaternion);
        // geo.rotateX(Math.PI * 0.5); // orient flat in the XZ plane
        // plane.scale.copy({
        //   x: child.scale.x + 0.2,
        //   y: child.scale.y,
        //   z: child.scale.z + 0.1,
        // });

        plane.position.copy({
          x: child.position.x + 0.04,
          // y: child.position.y - 0.39,
          y: child.position.y - 0.41,
          z: child.position.z + 0.35,
        }); // slight offset to prevent z-fighting
        // plane.quaternion.copy(child.quaternion);
        geo.rotateX(Math.PI * 0.5); // orient flat in the XZ plane
        plane.scale.copy({
          x: child.scale.x - 0.18,
          y: child.scale.y + 0.1,
          z: child.scale.z - 0.26,
        });

        screenParent.add(plane);
      }
    });

    scene.add(model);
  });

  // 🔄 Animation loop
  let prevIsAnimating = false;
  function animate() {
    requestAnimationFrame(animate);

    const animationState = getCameraAnimationState();

    // Calibrate once so gravity bias does not keep the camera permanently offset.
    if (
      !hasMotionBaseline &&
      (Math.abs(motion.x) > 0.3 || Math.abs(motion.y) > 0.3)
    ) {
      motionBaseline.x = motion.x;
      motionBaseline.y = motion.y;
      hasMotionBaseline = true;
    }

    // Keep parallax as an offset around the animated base camera pose.
    const parallaxStrength = 0.6;
    const motionXNorm = hasMotionBaseline
      ? THREE.MathUtils.clamp((motion.x - motionBaseline.x) / 9.81, -1, 1)
      : 0;
    const motionYNorm = hasMotionBaseline
      ? THREE.MathUtils.clamp((motion.y - motionBaseline.y) / 9.81, -1, 1)
      : 0;

    const motionEnabled = isMotionEnabled();
    const offsetX = animationState.isAnimating
      ? 0
      : (cursor.x + (motionEnabled ? motionXNorm : 0)) * parallaxStrength;
    const offsetY = animationState.isAnimating
      ? 0
      : -(cursor.y + (motionEnabled ? motionYNorm : 0)) * parallaxStrength;
    const targetX = cameraBasePosition.x + offsetX;
    const targetY = cameraBasePosition.y + offsetY;
    const follow = animationState.isAnimating ? 1 : 0.08;

    prevIsAnimating = animationState.isAnimating;

    camera.position.x += (targetX - camera.position.x) * follow;
    camera.position.y += (targetY - camera.position.y) * follow;
    camera.position.z += (cameraBasePosition.z - camera.position.z) * follow;

    controls.target.copy(cameraTarget);
    canvasTexture.needsUpdate = true;
    controls.update();
    renderer.render(scene, camera);
  }

  animate();

  // 📱 Resize handling
  window.addEventListener('resize', () => {
    camera.aspect = renderCanvas.clientWidth / renderCanvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      renderCanvas.clientWidth,
      renderCanvas.clientHeight,
      false,
    );
  });
};
