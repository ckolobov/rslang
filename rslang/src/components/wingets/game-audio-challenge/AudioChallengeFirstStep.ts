import Component from '../../common/Component';
import Drawer from '../../drawer/Drawer';
import Button from '../../common/Button';
import { GameScenario } from './AudioChallengeWidget';

const START_GAME_BUTTON_ID = 'start-audio-challenge-game-button';
const LEVEL_SELECT_ID = 'audio-challenge-level-select';

interface AudioChallengeFirstStepOptions {
  onConfirm(language: string, group: number): void;
  gameScenario: GameScenario;
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
      ${this.options.gameScenario === GameScenario.FROM_MAIN_MENU ? `<div class="level-select-container">
          <select class="select select-level" id="${LEVEL_SELECT_ID}">
            <option value="-1" selected>Случайный</option>
            <option value="0">A1</option>
            <option value="1">A2</option>
            <option value="2">B1</option>
            <option value="3">B2</option>
            <option value="4">C1</option>
            <option value="5">C2</option>
          </select>
        </div>`
        : ''
      }
      <select class="select select-language">
        <option value="Russian">Russian</option>
        <option value="English" selected>English</option>
      </select>
      ${startGameButtonHTML}
    `
  }

  public async after_render(): Promise<void> {
    const startGameButton: HTMLElement = document.getElementById(START_GAME_BUTTON_ID) as HTMLElement;
    const select: HTMLSelectElement = document.querySelector('.select-language') as HTMLSelectElement;
    const levelSelect = document.getElementById(LEVEL_SELECT_ID) as HTMLSelectElement;
    startGameButton.addEventListener('click', () => {
      const level = levelSelect ? Number((levelSelect).value) : 0;
      this.options.onConfirm(select.value, level);
    });
    return;
  }
}

export default AudioChallengeFirstStep;