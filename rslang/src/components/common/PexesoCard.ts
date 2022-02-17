import Component from './Component';

export interface PexCard {
  id: string;
  word: string;
  type: number;
}

class PexesoCard implements Component {
  private id: string;
  private word: string;
  private type: number;

  public constructor(options: PexCard) {
    this.id = options.id;
    this.word = options.word;
    this.type = options.type
  }

  public async render(): Promise<string> {
    const view = `
      <div class="flip-container">
        <div class="flipper ${this.id}">
          <div class="front-card">${this.type === 1 ? this.word : ''}</div>
          <div class="back-card">${this.word}</div>
        </div>
      </div>
    `;
    return view;
  }

  public async after_render(): Promise<void> {

    return;
  }
}

export default PexesoCard;
