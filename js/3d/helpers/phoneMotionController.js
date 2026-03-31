import { renderer } from '../renderer/renderer.js';
import { createPhoneMotion } from './phoneMotion.js';

export const { motion, enablePhoneMotion, disablePhoneMotion } =
  createPhoneMotion({
    domElement: renderer.domElement,
  });
