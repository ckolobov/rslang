import Component from '../../common/Component';
import Utils from '../../../services/Utils';
import Drawer from '../../drawer/Drawer';
import Button from '../../common/Button';

interface AudioChallengeQuestionStepOptions {
  word: Word;
  answers: Word[];
  scenario: number;
  language: string;
  onConfirm(result: boolean): void;
}

class AudioChallengeQuestionStep implements Component {
  private options: AudioChallengeQuestionStepOptions;
  private result = false;
  private isClickable = true;

  constructor(options: AudioChallengeQuestionStepOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    const answerButtonHTML = await Drawer.drawComponent(Button, {
      class: 'audio-challenge-question-button',
    });

    const idkButtonHTML = await Drawer.drawComponent(Button, {
      class: 'audio-challenge-idk-button',
      text: 'Не знаю',
    });

    return `
      <div class="audio-container"><div class="audio-challenge-audio"></div></div>
      <div id="audio-challenge-question-buttons" class="audio-challenge-question-buttons">
        ${answerButtonHTML}
        ${answerButtonHTML}
        ${answerButtonHTML}
        ${answerButtonHTML}
        ${answerButtonHTML}
      </div>
      ${idkButtonHTML}
    `;
  }

  public async after_render(): Promise<void> {
    const audio = new Audio();
    audio.src = Utils.getFullURL('/') + this.options.word.audio;
    audio.play();
    const buttons = document.querySelectorAll('.audio-challenge-question-button') as NodeListOf<HTMLElement>;
    buttons.forEach((button, index) => {
      button.innerHTML = this.options.answers[index][this.options.language];
      button.setAttribute('data-num', index.toString());
    });
    const buttonsBlock: HTMLElement = document.getElementById('audio-challenge-question-buttons') as HTMLElement;
    buttonsBlock.addEventListener('click', this.onButtonClick.bind(this));
    const nextButton = document.querySelector(`.audio-challenge-idk-button`) as HTMLButtonElement;
    nextButton.addEventListener('click', () => {
      this.isClickable = false;
      this.showRightAnswer();
    });
    const audioButton = document.querySelector('.audio-challenge-audio') as HTMLElement;
    audioButton.addEventListener('click', () => audio.play());
  }

  private showRightAnswer() {
    const rightButton = document.querySelector( `.audio-challenge-question-button[data-num="${this.options.scenario}"]`) as HTMLElement;
    const nextButton = document.querySelector(`.audio-challenge-idk-button`) as HTMLButtonElement;
    const audioButton = document.querySelector('.audio-challenge-audio') as HTMLElement;
    const audioContainer = document.querySelector(`.audio-container`) as HTMLElement;
    rightButton.classList.add('right-answer');
    nextButton.innerHTML = 'Далее';
    nextButton.removeEventListener('click', () => {
      this.isClickable = false;
      this.showRightAnswer();
    });
    audioButton.classList.add('active');
    audioContainer.prepend(this.options.word.word);
    const img = new Image();
    img.src = Utils.getFullURL('/') + this.options.word.image;
    img.style.width = '90px';
    img.style.height = '90px';
    img.style.borderRadius = '50%';
    img.onload = () => {
      audioContainer.prepend(img);
    };
    nextButton.addEventListener('click', () =>
      this.options.onConfirm(this.result)
    );
  }

  private onButtonClick(event: Event) {
    const button = (event.target as HTMLElement).closest('button');
    if (!button || !this.isClickable) return;
    this.isClickable = false;
    this.result = Number(button.dataset.num) === this.options.scenario;
    if (!this.result) {
      button.classList.add('wrong-answer');
    }
    this.showRightAnswer();
  }
}

export default AudioChallengeQuestionStep;
