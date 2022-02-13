import Component from '../../common/Component';
import Drawer from '../../drawer/Drawer';
import Button from '../../common/Button';

const START_GAME_BUTTON_ID = 'start-sprint-game-button';

interface SprintFirstStepOptions {
  onConfirm(): void;
}

class SprintFirstStep implements Component {
  private options: SprintFirstStepOptions;

  constructor(options: SprintFirstStepOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    const startGameButtonHTML = await Drawer.drawComponent(Button, {
      id: START_GAME_BUTTON_ID,
      text: `Start Game`,
    });

    return `
      <h1>Sprint</h1>
      ${startGameButtonHTML}
    `
  }

  public async after_render(): Promise<void> {
    const startGameButton: HTMLElement = document.getElementById(START_GAME_BUTTON_ID) as HTMLElement;
    startGameButton.addEventListener('click', this.options.onConfirm);
    return;
  }
}

export default SprintFirstStep;
