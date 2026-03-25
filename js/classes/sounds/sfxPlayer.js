import { SoundPlayer } from './soundPlayer.js';

const SOUNDS = {
  bump: { audio: new Audio('../../../assets/sounds/bump.mp3'), interval: 500 },
};

export class SfxPlayer extends SoundPlayer {
  constructor(anchorElement) {
    super(anchorElement);
    this.sounds = SOUNDS;
  }
}
