export const closeStartScreen = (startScreenElement) => {
  if (!startScreenElement) {
    return;
  }

  startScreenElement.classList.add('start-screen-closing');
  startScreenElement.addEventListener(
    'animationend',
    () => {
      startScreenElement.remove();
    },
    {
      once: true,
    },
  );
};
