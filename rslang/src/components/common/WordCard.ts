import Component from './Component';
import Utils from '../../services/Utils';
import AuthorizationForm from './AuthorizationForm';
import Request, { Difficulty } from '../../services/Requests';

export interface Card {
  _id: string;
  id: string;
  word: string;
  wordTranslate: string
  transcription: string
  audio: string;
  image: string;
  textMeaning: string;
  audioMeaning: string;
  textExample: string;
  textMeaningTranslate: string;
  textExampleTranslate: string;
  audioExample: string;
  diff: number;
  paginatedResults: object[];
}

class WordCard implements Component {
  private _id: string;
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
  private diff: number;

  public constructor(options: Card) {
    this.id = options.id;
    this._id = options._id;
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
    this.diff = options.diff;
  }

  public async render(): Promise<string> {
    const groupX =
      Number(window.location.hash.split('/')[2]) ||
      (Number(window.location.hash.split('/')[2]) === 0 ? 0 : 7);
      console.log(this.id||this._id, this.diff);
    const view = `
    <div class="word-card__card card-difficulty-${this.diff} group${groupX}" id="${this.id||this._id}">
      <div class="word-card__upper" style="background-image: url('${this.image}');">
        <div class="word-card__word">
          <div class="word-card__main-word">${this.word}</div>
          <div class="word-card__main-additional">
            <div class="word-card__translation">${this.wordTranslate}</div>
            <div class="word-card__transcription">${this.transcription}</div>
            <div class="word-card__audio">
              <audio src="${this.audio}" id="audio${this.id}"></audio>
              <audio src="${this.audioMeaning}" id="meaning${this.id||this._id}"></audio>
              <audio src="${this.audioExample}" id="example${this.id||this._id}"></audio>
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
      <div class="${groupX===6?"difficulty-buttons-hide":AuthorizationForm.isAuthorized?"difficulty-buttons-active":"difficulty-buttons-inactive"}">
        <div class="diff-button diff-hard" style="${this.diff===0? "pointer-events:none" : "pointer-events:''"}">${this.diff===2? "Убрать из сложного" : "Добавить в сложное"}</div>
        <div class="diff-button diff-learned" style="${this.diff===2? "pointer-events:none" : "pointer-events:''"}">${this.diff===0? "Убрать из изученного" : "Добавить в изученное"}</div> 
      </div>
    </div>
    `;
    return view;
  }

  private async changeWordDifficultyStatus(this:HTMLElement): Promise<void> {
    const parent = this.parentElement as HTMLElement;
    const card = parent.parentElement as HTMLElement;
    let idX:string, tokenX:string;
    try {
      tokenX = (localStorage.getItem('userInfo') as string).split('"token":"')[1].toString().split('",')[0];
      idX = (localStorage.getItem('userInfo') as string).split('"userId":"')[1].toString().split('",')[0];
    } catch {
      tokenX = '';
      idX = '';
    }
    const total_diff = Number(localStorage.getItem('rslang-current-page-total-difficulty'));
    if (this.innerHTML === 'Добавить в сложное') {
      this.innerHTML = 'Убрать из сложного';
      card.classList.remove('card-difficulty-1');
      card.classList.add('card-difficulty-2');
      (parent.children[1] as HTMLElement).setAttribute("style","pointer-events:none");
      await Request.editWordInUserWordsList(idX, tokenX, card.id, Difficulty.HARD, 0);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff + 1}`);
      if(total_diff-1 !== 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:""'));
      }
    } else {
      this.innerHTML = 'Добавить в сложное';
      card.classList.remove('card-difficulty-2');
      card.classList.add('card-difficulty-1');
      (parent.children[1] as HTMLElement).setAttribute("style","pointer-events:''");
      await Request.editWordInUserWordsList(idX, tokenX, card.id, Difficulty.NORMAL, 0);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff - 1}`);
      if(total_diff-1 === 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:none'));
      }
    }
  }

  private async changeWordLearnedStatus(this:HTMLElement): Promise<void> {
    const parent = this.parentElement as HTMLElement;
    const card = parent.parentElement as HTMLElement;
    let idX:string, tokenX: string;
    try {
      tokenX = (localStorage.getItem('userInfo') as string).split('"token":"')[1].toString().split('",')[0];
      idX = (localStorage.getItem('userInfo') as string).split('"userId":"')[1].toString().split('",')[0];
    } catch {
      tokenX = '';
      idX = '';
    }
    const total_diff = Number(localStorage.getItem('rslang-current-page-total-difficulty'));
    if (this.innerHTML === 'Добавить в изученное') {
      this.innerHTML = 'Убрать из изученного';
      card.classList.remove('card-difficulty-1');
      card.classList.add('card-difficulty-0');
      (parent.children[0] as HTMLElement).setAttribute("style","pointer-events:none");
      await Request.editWordInUserWordsList(idX, tokenX, card.id, Difficulty.LEARNED, 0);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff - 1}`);
      if(total_diff-1 === 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:none'));
      }
    } else {
      this.innerHTML = 'Добавить в изученное';
      card.classList.remove('card-difficulty-0');
      card.classList.add('card-difficulty-1');
      (parent.children[0] as HTMLElement).setAttribute("style","pointer-events:''");
      await Request.editWordInUserWordsList(idX, tokenX, card.id, Difficulty.NORMAL, 0);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff + 1}`);
      if(total_diff-1 !== 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:""'));
      }
    }
  }

  public async after_render(): Promise<void> {
    document.querySelectorAll('.diff-hard').forEach((el) => el.addEventListener('click', this.changeWordDifficultyStatus));
    document.querySelectorAll('.diff-learned').forEach((el) => el.addEventListener('click', this.changeWordLearnedStatus));
    return;
  }
}

export default WordCard;
