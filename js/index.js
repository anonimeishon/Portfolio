import * as THREE from 'three';
import { startGameCourse } from './courseWay.js';
import { testThree, camera, controls } from './threeTest.js';

window.onload = () => {
  // startGame();
  startGameCourse(mainCanvas);
  testThree({ secondaryCanvas });
};

export { camera };

export const resetCamera = (duration = 700) => {
  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(-0.8, 0.4, 1.5);
  const startTime = performance.now();

  const easeInOut = (t) => t * t * (3 - 2 * t);

  const step = (now) => {
    const tRaw = Math.min((now - startTime) / duration, 1);
    const t = easeInOut(tRaw);

    camera.position.lerpVectors(startPos, endPos, t);
    camera.lookAt(0, 0, 0);

    if (tRaw < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};
export const setGameCamera = (duration = 700) => {
  const startPos = camera.position.clone();
  const endPos = new THREE.Vector3(0, 1, 1.3);
  const startTime = performance.now();

  const easeInOut = (t) => t * t * (3 - 2 * t);

  const step = (now) => {
    const tRaw = Math.min((now - startTime) / duration, 1);
    const t = easeInOut(tRaw);

    camera.position.lerpVectors(startPos, endPos, t);
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    if (tRaw < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
};

window.resetCamera = resetCamera;
window.setGameCamera = setGameCamera;
console.log(resetCamera);
