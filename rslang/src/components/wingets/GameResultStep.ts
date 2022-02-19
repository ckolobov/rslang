import './GameResultStep.scss';
import Component from '../common/Component';
import Drawer from '../drawer/Drawer';
import WordResult from './WordResult';

interface GameResultStepOptions {
  correct: number;
  wrong: number;
  playerResult: Array<[Word, boolean]>;
}

class GameResultStep implements Component {
  private options: GameResultStepOptions;

  constructor(options: GameResultStepOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    const arr: Array<Promise<string>> = [];
    this.options.playerResult.forEach((res) => arr.push(
        Drawer.drawComponent(WordResult, {
          word: res[0],
          isGuessed: res[1],
        })
      )
    );
    const results = (await Promise.all(arr)).flat().join('');

    return `
      <h1>Results</h1>
      <div class="results results--correct">Correct: ${this.options.correct}</div>
      <div class="results results--wrong">Wrong: ${this.options.wrong}</div>
      <div class="results-container">${results}</div>
    `;
  }

  private playAudio(event: Event) {
    const audio = (event.target as HTMLElement).closest('.audio');
    if (!audio) return;
    (audio.firstElementChild as HTMLAudioElement).play();
  }

  public async after_render(): Promise<void> {
    const container = document.querySelector('.results-container') as HTMLElement;
    container.addEventListener('click', this.playAudio.bind(this));
  }
}

export default GameResultStep;
