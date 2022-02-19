import Component from '../../common/Component';
import Utils from '../../../services/Utils';
import Drawer from '../../drawer/Drawer';
import Button from '../../common/Button';

interface AudioChallengeQuestionStepOptions {
  word: Word;
  answers: Word[];
  scenario: number;
  language: string;
  onConfirm(): void;
  onAnswer(result: boolean) : void;
}

const keyCodeMapping = {
  Digit1: 0,
  Digit2: 1,
  Digit3: 2,
  Digit4: 3,
  Digit5: 4,
  Space: 'next',
  Enter: 'next',
};

class AudioChallengeQuestionStep implements Component {
  private options: AudioChallengeQuestionStepOptions;
  private result = false;
  private isClickable = true;
  private keyPressHandler = this.onKeyDown.bind(this);
  private nextBtnPressHandler = this.onNextBtnClick.bind(this);

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
      button.innerHTML = `${index + 1}) ${this.options.answers[index][this.options.language]}`;
      button.setAttribute('data-num', index.toString());
    });
    const buttonsBlock: HTMLElement = document.getElementById('audio-challenge-question-buttons') as HTMLElement;
    buttonsBlock.addEventListener('click', this.onButtonClick.bind(this));
    const nextButton = document.querySelector(`.audio-challenge-idk-button`) as HTMLButtonElement;
    nextButton.addEventListener('click', this.nextBtnPressHandler);
    const audioButton = document.querySelector('.audio-challenge-audio') as HTMLElement;
    audioButton.addEventListener('click', () => audio.play());
    document.addEventListener('keydown', this.keyPressHandler);
  }

  private showRightAnswer() {
    const rightButton = document.querySelector( `.audio-challenge-question-button[data-num="${this.options.scenario}"]`) as HTMLElement;
    const nextButton = document.querySelector(`.audio-challenge-idk-button`) as HTMLButtonElement;
    const audioButton = document.querySelector('.audio-challenge-audio') as HTMLElement;
    const audioContainer = document.querySelector(`.audio-container`) as HTMLElement;
    rightButton.classList.add('right-answer');
    nextButton.innerHTML = 'Далее';
    nextButton.removeEventListener('click', this.nextBtnPressHandler);
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
    this.options.onAnswer(this.result);
    nextButton.addEventListener('click', () =>
      this.options.onConfirm()
    );
  }

  private onNextBtnClick() {
    console.log('1')
    this.isClickable = false;
    this.showRightAnswer();
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

  private onKeyDown(event: KeyboardEvent): void {
    const keyCode = event.code;
    if (!(keyCode in keyCodeMapping)) return;
    event.preventDefault();
    event.stopPropagation();
    if (typeof keyCodeMapping[keyCode] === 'number' && this.isClickable === true) {
      this.isClickable = false;
      this.result = keyCodeMapping[keyCode] === this.options.scenario;
      if (!this.result) {
        const button = document.querySelector(`.audio-challenge-question-button[data-num="${keyCodeMapping[keyCode]}"]`) as HTMLElement;
        button.classList.add('wrong-answer');
      }
      this.showRightAnswer();
    } else if (keyCodeMapping[keyCode] === 'next') {
      const nextButton = document.querySelector(`.audio-challenge-idk-button`) as HTMLButtonElement;
      if (nextButton.textContent === 'Не знаю') {
        this.isClickable = false;
        this.showRightAnswer();
      } else if(nextButton.textContent === 'Далее') {
        document.removeEventListener('keydown', this.keyPressHandler);
        this.options.onConfirm();
      }
    }
  }
}

export default AudioChallengeQuestionStep;
