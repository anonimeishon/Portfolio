import { CurvedText } from './CurvedText.js';

export const createModelCredits = () =>
  new CurvedText({
    text: 'Model by Wikiti on Sketchfab',
    size: 0.045,
    color: 0xffffff,
    arc: {
      center: { x: 0, y: 0.55, z: 0.12 },
      radius: 1.5,
      tilt: 0,
    },
  });
