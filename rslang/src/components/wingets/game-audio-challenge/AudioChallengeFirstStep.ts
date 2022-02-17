import Component from '../../common/Component';
import Drawer from '../../drawer/Drawer';
import Button from '../../common/Button';

const START_GAME_BUTTON_ID = 'start-audio-challenge-game-button';

interface AudioChallengeFirstStepOptions {
  onConfirm(language: string): void;
}

class AudioChallengeFirstStep implements Component {
  private options: AudioChallengeFirstStepOptions;

  constructor(options: AudioChallengeFirstStepOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    const startGameButtonHTML = await Drawer.drawComponent(Button, {
      id: START_GAME_BUTTON_ID,
      text: `Start Game`,
    });

    return `
      <h1>Audio Challenge</h1> 
      <select class="select-language">
        <option value="Russian">Russian</option>
        <option value="English" selected>English</option>
      </select>
      ${startGameButtonHTML}
    `
  }

  public async after_render(): Promise<void> {
    const startGameButton: HTMLElement = document.getElementById(START_GAME_BUTTON_ID) as HTMLElement;
    const select: HTMLSelectElement = document.querySelector('.select-language') as HTMLSelectElement;
    startGameButton.addEventListener('click', () => this.options.onConfirm(select.value));
    return;
  }
}

export default AudioChallengeFirstStep;