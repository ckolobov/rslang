import Component from "./Component";

class Button implements Component {
  private class: string;
  private id: string;

  public constructor(options) {
    this.class = options.class;
    this.id = options.id;
  }

  public async render(): Promise<string> {
    const view = `
      <button id="${this.id ? this.id : ''}" class="button ${this.class}"></button>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    console.log('button after_render');
  }
}

export default Button
