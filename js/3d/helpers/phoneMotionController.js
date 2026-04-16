import { renderer } from '../components/renderer/renderer.js';
import { createPhoneMotion } from './phoneMotion.js';

export const {
  motion,
  isMotionEnabled,
  enablePhoneMotion,
  disablePhoneMotion,
} = await createPhoneMotion({
  domElement: renderer.domElement,
});
