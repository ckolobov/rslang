import Component from './Component';
import Utils from '../../services/Utils';

export interface Card {
  word: string;
  translation: string;
  transcription: string;
  audio: string;
  image: string;
  meaning_english: string;
  example_english: string;
  meaning_russian: string;
  example_russian: string;
}

class WordCard implements Component {
  private id: string;
  private word: string;
  private wordTranslate: string;
  private transcription: string;
  private audio: string;
  private image: string;
  private textMeaning: string;
  private audioMeaning: string;
  private textExample: string;
  private audioExample: string;
  private textMeaningTranslate: string;
  private textExampleTranslate: string;

  public constructor(options) {
    this.id = options.id;
    this.word = options.word;
    this.wordTranslate = options.wordTranslate;
    this.transcription = options.transcription;
    this.audio = Utils.getFullURL('/') + options.audio;
    this.image = Utils.getFullURL('/') + options.image;
    this.textMeaning = options.textMeaning;
    this.audioMeaning = Utils.getFullURL('/') + options.audioMeaning;
    this.textExample = options.textExample;
    this.audioExample = Utils.getFullURL('/') + options.audioExample;
    this.textMeaningTranslate = options.textMeaningTranslate;
    this.textExampleTranslate = options.textExampleTranslate;
  }

  public async render(): Promise<string> {
    const view = `
    <div class="word-card__card" id="${this.id}">
      <div class="word-card__upper" style="background-image: url('${this.image}');">
        <div class="word-card__word">
          <div class="word-card__main-word">${this.word}</div>
          <div class="word-card__main-additional">
            <div class="word-card__translation">${this.wordTranslate}</div>
            <div class="word-card__transcription">${this.transcription}</div>
            <div class="word-card__audio">
              <audio src="${this.audio}" id="audio${this.id}"></audio>
              <audio src="${this.audioMeaning}" id="meaning${this.id}"></audio>
              <audio src="${this.audioExample}" id="example${this.id}"></audio>
            </div>
          </div>  
        </div>
      </div>
      <div class="word-card_lower">
        <div class="card-text meaning_english">${this.textMeaning}</div>
        <div class="card-text example_english">${this.textExample}</div>
        <hr>
        <div class="card-text meaning_russian">${this.textMeaningTranslate}</div>
        <div class="card-text example_russian">${this.textExampleTranslate}</div>
      </div>
    </div>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default WordCard;
