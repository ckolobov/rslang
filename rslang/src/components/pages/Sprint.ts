import Page from './Page';
import SprintWidget from '../wingets/game-sprint/SprintWidget';

const SPRINT_WIDGET_CONTAINER_ID = 'sprint-game-container';
class Sprint implements Page {
  public async render(): Promise<string> {
    const view = `
      <section class="section">
        <div class="${SPRINT_WIDGET_CONTAINER_ID}" id="${SPRINT_WIDGET_CONTAINER_ID}">
      </section>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    const sprintWidgetContainer = document.getElementById(
      SPRINT_WIDGET_CONTAINER_ID
    ) as HTMLElement;
    const widget = new SprintWidget(sprintWidgetContainer);
    await widget.showFirsStep();
  }
}

export default Sprint;
