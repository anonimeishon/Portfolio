export const setupMenuButton = () => {
  const toggleButton = document.getElementById('menuToggleButton');
  const fullscreenButton = document.getElementById('fullscreenToggleButton');
  const modal = document.getElementById('portfolioModal');
  const closeButton = document.getElementById('portfolioModalClose');

  if (!toggleButton || !modal) return;

  const openModal = () => {
    modal.classList.add('is-open');
    toggleButton.classList.add('is-active');
  };
  const closeModal = () => {
    modal.classList.remove('is-open');
    toggleButton.classList.remove('is-active');
  };

  toggleButton.addEventListener('click', openModal);
  closeButton?.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  if (!fullscreenButton) return;

  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      return document.documentElement.requestFullscreen();
    }

    if (document.documentElement.webkitRequestFullscreen) {
      return document.documentElement.webkitRequestFullscreen();
    }

    return Promise.reject(new Error('Fullscreen is not supported'));
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      return document.exitFullscreen();
    }

    if (document.webkitExitFullscreen) {
      return document.webkitExitFullscreen();
    }

    return Promise.resolve();
  };

  const isFullscreen = () =>
    Boolean(document.fullscreenElement || document.webkitFullscreenElement);

  const syncFullscreenState = () => {
    fullscreenButton.classList.toggle('is-active', isFullscreen());
  };

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen()) {
        await exitFullscreen();
      } else {
        await enterFullscreen();
      }
    } catch (error) {}

    syncFullscreenState();
  };

  fullscreenButton.addEventListener('click', toggleFullscreen);
  window.toggleFullscreen = toggleFullscreen; // Expose for game menu
  document.addEventListener('fullscreenchange', syncFullscreenState);
  document.addEventListener('webkitfullscreenchange', syncFullscreenState);
  syncFullscreenState();
};
