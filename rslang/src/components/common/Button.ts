import Component from './Component';
import '../../scss/components/_button.scss';

interface ButtonOptions {
  class?: string;
  id?: string;
  text?: string;
  additionalAttributes?: string;
}
class Button implements Component {
  private options: ButtonOptions;

  public constructor(options: ButtonOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    const view = `
      <button id="${this.options.id ? this.options.id : ''}" class="button
      ${this.options.class ? this.options.class : ''}"
      ${
        this.options.additionalAttributes
          ? this.options.additionalAttributes
          : ''
      }>${this.options.text ? this.options.text : ''}</button>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default Button;
