import { startGameCourse } from './courseWay.js';
import { testThree } from './threeTest.js';
window.onload = () => {
  // startGame();
  startGameCourse(mainCanvas);
  testThree({ secondaryCanvas });
};
