import Component from '../../common/Component';
import Drawer from '../../drawer/Drawer';
import Button from '../../common/Button';
import { QuestionScenario, Results } from './SprintWidget';

interface SprintQuestionStepOptions {
  word: Word;
  translation: Word;
  scenario: QuestionScenario;
  onConfirm(result: Results): void;
}

const keyCodeMapping = {
  'ArrowLeft': false,
  'ArrowRight': true
}

class SprintQuestionStep implements Component {
  private options: SprintQuestionStepOptions;
  private keyPressHandler = this.onKeyDown.bind(this);
  private hashChangeHandler = this.onHashChange.bind(this);

  constructor(options: SprintQuestionStepOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    const answerFalseButtonHTML = await Drawer.drawComponent(Button, {
      class: 'sprint-question-button sprint-question-button--wrong',
      text: `← Wrong`,
      additionalAttributes: 'data-result="0"',
    });

    const answerTrueButtonHTML = await Drawer.drawComponent(Button, {
      class: 'sprint-question-button sprint-question-button--correct',
      text: `Correct →`,
      additionalAttributes: 'data-result="1"',
    });

    const word = this.options.word.word;
    const translation = this.options.translation.wordTranslate;

    return `
      <div class="sprint-question-word">${word}</div>
      <div class="sprint-question-translation">${translation}</div>
      <div id="sprint-question-buttons" class="sprint-question-buttons">
        ${answerFalseButtonHTML}
        ${answerTrueButtonHTML}
      </div>
    `;
  }

  public async after_render(): Promise<void> {
    const buttonsBlock: HTMLElement = document.getElementById(
      'sprint-question-buttons'
    ) as HTMLElement;
    buttonsBlock.addEventListener('click', (event) => this.onButtonClick(event));
    document.addEventListener('keydown', this.keyPressHandler, {once: true});
    window.addEventListener('hashchange', this.hashChangeHandler, {once: true});
  }

  private onButtonClick(event: MouseEvent): void {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) return;
    const answer = button.dataset.result;
    if (!answer) throw new Error('Answer is unknown!');
    const result = this.options.scenario === Number(answer);
    this.onConfirm(result);
  }

  private onKeyDown(event: KeyboardEvent): void {
    const keyCode = event.code;
    if (keyCode in keyCodeMapping) {
      event.preventDefault();
      event.stopPropagation();
      const result = this.options.scenario === Number(keyCodeMapping[keyCode]);
      this.onConfirm(result);
    }
  }

  private onHashChange(): void {
    document.removeEventListener('keydown', this.keyPressHandler);
  }

  private onConfirm(result: boolean) {
    document.removeEventListener('keydown', this.keyPressHandler);
    window.removeEventListener('hashchange', this.hashChangeHandler);
    this.options.onConfirm(Number(result));
  }
}

export default SprintQuestionStep;
