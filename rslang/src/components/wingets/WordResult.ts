import './WordResult.scss';
import Component from '../common/Component';
import Utils from '../../services/Utils';

interface WordResultOptions {
  word: Word,
  isGuessed: boolean,
}

class WordResult implements Component {
  private options: WordResultOptions;

  constructor(options: WordResultOptions) {
    this.options = options;
  }

  public async render(): Promise<string> {
    return `
      <div class="word-result">
        <div class="word-result__result ${this.options.isGuessed ? 'word-result__result_correct' : 'word-result__result_wrong'}"></div>
        <div class="audio"><audio src="${Utils.getFullURL('/')}${this.options.word.audio}"></audio></div>
        <p class="word-result__text"> ${this.options.word.word} &mdash; ${this.options.word.wordTranslate}</p>
      </div>
    `;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default WordResult;