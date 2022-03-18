import Component from '../../common/Component';

interface QuestionStepComponentsOptions {
  timerContainer: string;
  questionsContainer: string;
  correctAnswersContainer: string;
  wrongAnswersContainer: string;
}

class QuestionStepComponents implements Component {
  private options: QuestionStepComponentsOptions;

  constructor(options: QuestionStepComponentsOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    return `
      <div id=${this.options.timerContainer}></div>
      <div class="results-count">
        <p class="results-count__item"><span class="icon icon-correct"></span><span id=${this.options.correctAnswersContainer}></span></p>
        <p class="results-count__item"><span class="icon icon-wrong"></span><span id=${this.options.wrongAnswersContainer}></span></p>
      </div>
      <div class="${this.options.questionsContainer}" id=${this.options.questionsContainer}></div>
    `;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default QuestionStepComponents;
