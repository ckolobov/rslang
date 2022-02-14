import Component from '../../common/Component';
import Drawer from '../../drawer/Drawer';
import Button from '../../common/Button';
import { Scenario, Results } from './SprintWidget';

interface SprintQuestionStepOptions {
  word: Word;
  translation: Word;
  scenario: Scenario;
  onConfirm(result: Results): void;
}

class SprintQuestionStep implements Component {
  private options: SprintQuestionStepOptions;

  constructor(options: SprintQuestionStepOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    const answerFalseButtonHTML = await Drawer.drawComponent(Button, {
      class: 'sprint-question-button sprint-question-button--wrong',
      text: `Wrong`,
      additionalAttributes: 'data-result="0"',
    });

    const answerTrueButtonHTML = await Drawer.drawComponent(Button, {
      class: 'sprint-question-button sprint-question-button--correct',
      text: `Correct`,
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
    buttonsBlock.addEventListener('click', this.onButtonClick.bind(this));
  }

  private onButtonClick(event: Event) {
    const button = (event.target as HTMLElement).closest('button');
    if (!button) return;
    const answer = button.dataset.result;
    if (!answer) throw new Error('Answer is unknown!');
    const result = this.options.scenario === Number(answer);
    this.options.onConfirm(Number(result));
  }
}

export default SprintQuestionStep;
