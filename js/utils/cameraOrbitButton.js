const CAMERA_ORBIT_ANIMATION = {
  duration: 900,
  easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
  fill: 'forwards',
};

export const setupCameraOrbitButton = () => {
  const cameraOrbitButton = document.getElementById('cameraOrbitButton');
  const cameraOrbitArrow = document.getElementById('cameraOrbitArrow');

  if (!cameraOrbitButton || !cameraOrbitArrow) {
    return;
  }

  let arrowAnimation = null;

  cameraOrbitButton.addEventListener('click', () => {
    arrowAnimation?.cancel();
    cameraOrbitArrow.style.transform = 'rotate(0deg)';

    arrowAnimation = cameraOrbitArrow.animate(
      [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }],
      CAMERA_ORBIT_ANIMATION,
    );
  });
};
