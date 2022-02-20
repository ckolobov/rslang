import Component from './Component';
import Utils from '../../services/Utils';
import Authorization from '../../services/Authorization';
import Request, { Difficulty } from '../../services/Request/Requests';
import Statistics from '../pages/Statistics';

export interface Card {
  _id: string;
  id: string;
  word: string;
  wordTranslate: string;
  transcription: string;
  audio: string;
  image: string;
  textMeaning: string;
  audioMeaning: string;
  textExample: string;
  textMeaningTranslate: string;
  textExampleTranslate: string;
  audioExample: string;
  diff: number;
  correctSprint: number;
  wrongSprint: number;
  correctAudioChallenge: number;
  wrongAudioChallenge: number;
  correctPexesoOCM: number;
  wrongPexesoOCM: number;
  paginatedResults: Card[];
}

export enum CardDifficultyStyle {
  LEARNED = "card-difficulty-0",
  NORMAL = "card-difficulty-1",
  HARD = "card-difficulty-2",
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
  private diff: number;
  private correctSprint: number;
  private wrongSprint: number;
  private correctAudioChallenge: number;
  private wrongAudioChallenge: number;
  private correctPexesoOCM: number;
  private wrongPexesoOCM: number;
  private authorization: Authorization;

  public constructor(options: Card) {
    this.id = options.id||options._id;
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
    this.diff = isNaN(options.diff) ? 1: options.diff;
    this.correctSprint = isNaN(options.correctSprint) ? 0: options.correctSprint;
    this.wrongSprint = isNaN(options.wrongSprint) ? 0: options.wrongSprint;
    this.correctAudioChallenge = isNaN(options.correctAudioChallenge) ? 0: options.correctAudioChallenge;
    this.wrongAudioChallenge = isNaN(options.wrongAudioChallenge) ? 0: options.wrongAudioChallenge;
    this.correctPexesoOCM = isNaN(options.correctPexesoOCM) ? 0: options.correctPexesoOCM;
    this.wrongPexesoOCM = isNaN(options.wrongPexesoOCM) ? 0: options.wrongPexesoOCM;
    this.authorization = Authorization.getInstance();
  }

  public async render(): Promise<string> {
    const url = Utils.parseRequestURL();
    const currentMenuItem = url.resource;
    const currentGroup = Number(url.id) || (Number(url.id) === 0 ? 0 : 7);
    const Sprintrate = Math.round((this.correctSprint/(this.correctSprint+this.wrongSprint))*100)||0;
    const Audiorate = Math.round((this.correctAudioChallenge/(this.correctAudioChallenge+this.wrongAudioChallenge))*100)||0;
    const PexesoOCMrate = Math.round((this.correctPexesoOCM/(this.correctPexesoOCM+this.wrongPexesoOCM))*100)||0;
    const popup = `
    <div class="popup_wrapper" style="display:none">
      <div class="close">X</div>
      <p class="game-type">Sprint</p>
      <div class="sprint-game-info">
        <div class="game-result-box">
          <p class="game-result">Correct: ${this.correctSprint}</p>
          <p class="game-result">Wrong: ${this.wrongSprint}</p>
        </div>
        <div class="diagramm">
          <svg viewBox="0 0 300 300" >
            <circle class="track"  cx="150" cy="150" r="111.4" />
            <circle id="Circ_points" transform="rotate(-90 150 150)"  cx="150" cy="150" r="111.4" stroke-dasharray="${7*Sprintrate}, ${7*(100-Sprintrate)}"/>
            <text x="50%" y="165px" id="txt1"  text-anchor="middle" font-size="56px">${Sprintrate}%</text>
          </svg>
        </div>
      </div>
      <p class="game-type">Audio Challenge</p>
      <div class="audio-challenge-game-info">
        <div class="game-result-box">
          <p class="game-result">Correct: ${this.correctAudioChallenge}</p>
          <p class="game-result">Wrong: ${this.wrongAudioChallenge}</p>
        </div>
        <div class="diagramm">
          <svg viewBox="0 0 300 300" >
          <circle class="track"  cx="150" cy="150" r="111.4" />
          <circle id="Circ_points" transform="rotate(-90 150 150)"  cx="150" cy="150" r="111.4" stroke-dasharray="${7*Audiorate}, ${7*(100-Audiorate)}"/>
          <text x="50%" y="165px" id="txt1"  text-anchor="middle" font-size="56px">${Audiorate}%</text>
          </svg>
        </div>
      </div>
      <p class="game-type">Pexeso (open card mode)</p>
      <div class="audio-challenge-game-info">
        <div class="game-result-box">
          <p class="game-result">Correct: ${this.correctPexesoOCM}</p>
          <p class="game-result">Wrong: ${this.wrongPexesoOCM}</p>
        </div>
        <div class="diagramm">
          <svg viewBox="0 0 300 300" >
          <circle class="track"  cx="150" cy="150" r="111.4" />
          <circle id="Circ_points" transform="rotate(-90 150 150)"  cx="150" cy="150" r="111.4" stroke-dasharray="${7*PexesoOCMrate}, ${7*(100-PexesoOCMrate)}"/>
          <text x="50%" y="165px" id="txt1"  text-anchor="middle" font-size="56px">${PexesoOCMrate}%</text>
          </svg>
        </div>
      </div>
    </div>
    `;
    const view = `
    <div class="word-card__card card-difficulty-${currentMenuItem==='textbook' ? this.diff : 1} group${currentMenuItem==='textbook' ? currentGroup : 6}" id="${this.id}">
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
      <div class="${(currentMenuItem !== 'textbook' || currentGroup === 6) ? 
        "difficulty-buttons-hide" : 
        this.authorization.isAuthorized() ? 
          "difficulty-buttons-active" : "difficulty-buttons-inactive"}">
        <div class="diff-button diff-hard" style="${this.diff === 0 ?
          "pointer-events:none" : 
          "pointer-events:''"}">${this.diff === 2 ? "Убрать из сложного" : "Добавить в сложное"}</div>
        <div class = "popup-section">
          <div class="word-statistics-button">i</div>
          ${popup}
        </div>
        <div class="diff-button diff-learned" style="${this.diff === 2 ?
          "pointer-events:none" :
          "pointer-events:''"}">${this.diff===0? "Убрать из изученного" : "Добавить в изученное"}</div>
      </div>

    </div>
    `;
    return view;
  }

  private async changeWordDifficultyStatus(event: MouseEvent): Promise<void> {
    const button = event.currentTarget as HTMLElement;
    const parent = button.parentElement as HTMLElement;
    const card = parent.parentElement as HTMLElement;
    let currentId = '';
    let currentToken = '';
    if (this.authorization.isAuthorized()) {
      const userInfo = this.authorization.getUserInfo();
      currentId = userInfo.id;
      currentToken = userInfo.token;
    }
    const total_diff = Number(localStorage.getItem('rslang-current-page-total-difficulty'));
    if (card.classList.contains(`${CardDifficultyStyle.NORMAL}`)) {
      button.innerHTML = 'Убрать из сложного';
      card.classList.remove(`${CardDifficultyStyle.NORMAL}`);
      card.classList.add(`${CardDifficultyStyle.HARD}`);
      (parent.children[2] as HTMLElement).setAttribute("style","pointer-events:none");
      const word = await Request.getWordFromUserWordsList(currentId, currentToken, card.id);
      await Request.editWordInUserWordsList(
        currentId, currentToken, card.id, Difficulty.HARD, 
        word.optional.correctInRow, word.optional.correctTotalSprint, 
        word.optional.wrongTotalSprint, word.optional.correctTotalAudioChallenge, word.optional.wrongTotalAudioChallenge, 
        word.optional.correctTotalPexesoOCM, word.optional.wrongTotalPexesoOCM, word.optional.wasInGame);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff + 1}`);
      if(total_diff-1 !== 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:""'));
      }
    } else {
      button.innerHTML = 'Добавить в сложное';
      card.classList.remove(`${CardDifficultyStyle.HARD}`);
      card.classList.add(`${CardDifficultyStyle.NORMAL}`);
      (parent.children[2] as HTMLElement).setAttribute("style","pointer-events:''");
      const word = await Request.getWordFromUserWordsList(currentId, currentToken, card.id);
      await Request.editWordInUserWordsList(
        currentId, currentToken, card.id, Difficulty.NORMAL,word.optional.correctInRow, word.optional.correctTotalSprint, 
        word.optional.wrongTotalSprint, word.optional.correctTotalAudioChallenge, word.optional.wrongTotalAudioChallenge, 
        word.optional.correctTotalPexesoOCM, word.optional.wrongTotalPexesoOCM, word.optional.wasInGame);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff - 1}`);
      if(total_diff-1 === 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:none'));
      }
    }
  }

  private async changeWordLearnedStatus(event: MouseEvent): Promise<void> {
    const button = event.currentTarget as HTMLElement;
    const parent = button.parentElement as HTMLElement;
    const card = parent.parentElement as HTMLElement;
    const dateToday = new Date();
    const date = `${dateToday.getDate().toString().padStart(2, '0')}-${dateToday.getMonth().toString().padStart(2, '0')}-${dateToday.getFullYear()}`;
    let currentId = '';
    let currentToken = '';
    if (this.authorization.isAuthorized()) {
      const userInfo = this.authorization.getUserInfo();
      currentId = userInfo.id;
      currentToken = userInfo.token;
    }
    const total_diff = Number(localStorage.getItem('rslang-current-page-total-difficulty'));
    if (card.classList.contains(`${CardDifficultyStyle.NORMAL}`)) {
      button.innerHTML = 'Убрать из изученного';
      card.classList.remove(`${CardDifficultyStyle.NORMAL}`);
      card.classList.add(`${CardDifficultyStyle.LEARNED}`);
      (parent.children[0] as HTMLElement).setAttribute("style","pointer-events:none");
      const word = await Request.getWordFromUserWordsList(currentId, currentToken, card.id);
      await Request.editWordInUserWordsList(
        currentId, currentToken, card.id, Difficulty.LEARNED,
        word.optional.correctInRow, word.optional.correctTotalSprint, 
        word.optional.wrongTotalSprint, word.optional.correctTotalAudioChallenge, word.optional.wrongTotalAudioChallenge, 
        word.optional.correctTotalPexesoOCM, word.optional.wrongTotalPexesoOCM, word.optional.wasInGame);
      await Statistics.updateStatistics();
      Statistics.learnedWords += 1;
      Statistics.data[date].textbookLearn  += 1;
      await Request.editStatistics(currentId, currentToken, Statistics.data, Statistics.learnedWords);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff - 1}`);
      if(total_diff-1 === 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:none'));
      }
    } else {
      button.innerHTML = 'Добавить в изученное';
      card.classList.remove(`${CardDifficultyStyle.LEARNED}`);
      card.classList.add(`${CardDifficultyStyle.NORMAL}`);
      (parent.children[0] as HTMLElement).setAttribute("style","pointer-events:''");
      const word = await Request.getWordFromUserWordsList(currentId, currentToken, card.id);
      await Request.editWordInUserWordsList(
        currentId, currentToken, card.id, Difficulty.NORMAL,
        word.optional.correctInRow, word.optional.correctTotalSprint, 
        word.optional.wrongTotalSprint, word.optional.correctTotalAudioChallenge, word.optional.wrongTotalAudioChallenge, 
        word.optional.correctTotalPexesoOCM, word.optional.wrongTotalPexesoOCM, word.optional.wasInGame);
      await Statistics.updateStatistics();
      Statistics.learnedWords -= 1;
      Statistics.data[date].textbookLearn  -= 1;
      await Request.editStatistics(currentId, currentToken, Statistics.data, Statistics.learnedWords);
      localStorage.setItem('rslang-current-page-total-difficulty', `${total_diff + 1}`);
      if(total_diff-1 !== 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:""'));
      }
    }
  }

  private async showStatisticsPopup(this:HTMLElement): Promise<void> {
    (this.nextElementSibling as HTMLElement).setAttribute('style', 'display: flex');
  }
  private async hideStatisticsPopup(this:HTMLElement): Promise<void> {
    (this.parentElement as HTMLElement).setAttribute('style', 'display: none');
  }

  public async after_render(): Promise<void> {
    const card = document.getElementById(this.id) as HTMLElement;

    const diffHardButton = card.querySelector('.diff-hard') as HTMLButtonElement;
    diffHardButton.addEventListener('click', this.changeWordDifficultyStatus.bind(this));

    const diffLearnedButton = card.querySelector('.diff-learned') as HTMLButtonElement;
    diffLearnedButton.addEventListener('click', this.changeWordLearnedStatus.bind(this));

    const wordStatisticsButton = card.querySelector('.word-statistics-button') as HTMLButtonElement;
    wordStatisticsButton.addEventListener('click', this.showStatisticsPopup);

    const popupCloseButton = card.querySelector('.close') as HTMLButtonElement;
    popupCloseButton.addEventListener('click', this.hideStatisticsPopup);
    return;
  }
}

export default WordCard;
