import Component from './Component';
import '../../scss/components/_button.scss';

class Button implements Component {
  private class: string;
  private id: string;
  private text: string;

  public constructor(options) {
    this.class = options.class;
    this.id = options.id;
    this.text = options.text;
  }

  public async render(): Promise<string> {
    const view = `
      <button id="${this.id ? this.id : ''}" class="button 
      ${this.class ? this.class : ''}">${this.text}</button>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default Button;
