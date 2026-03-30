import { startGameCourse } from './courseWay.js';
import { testThree } from './threeTest.js';
window.onload = () => {
  // startGame();
  console.log({ secondaryCanvas });
  startGameCourse(mainCanvas);
  testThree({ secondaryCanvas });
};
