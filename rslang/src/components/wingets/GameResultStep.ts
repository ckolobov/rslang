import './GameResultStep.scss';
import Component from '../common/Component';

interface GameResultStepOptions {
  correct: number;
  wrong: number;
}

class GameResultStep implements Component {
  private options: GameResultStepOptions;

  constructor(options: GameResultStepOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    return `
      <h1>Results</h1>
      <div class="results results--correct">Correct: ${this.options.correct}</div>
      <div class="results results--wrong">Wrong: ${this.options.wrong}</div>
    `;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default GameResultStep;
