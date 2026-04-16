import { Text } from './Text.js';

export const createInstructionsArrow = () => {
  const text = new Text({
    text: '↗',
    size: 0.22,
    color: 0xffffff,
    position: { x: 0.5, y: 1.3, z: 0.1 },
    depth: 0.04,
  });
  return text;
};
