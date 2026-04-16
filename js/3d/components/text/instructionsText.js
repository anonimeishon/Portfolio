import { Text } from './Text.js';

export const createInstructionsText = () => {
  const text = new Text({
    text: 'Click here',
    size: 0.12,
    color: 0xffffff,
    position: { x: 0, y: 1.1, z: 0.1 },
    depth: 0.04,
  });
  return text;
};
