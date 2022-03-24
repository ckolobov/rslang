import Page from './Page';
import Request from '../../services/Request/Requests';
import WordCard, { Card } from '../common/WordCard';
import '../../scss/layout/_hangman.scss';
import Drawer from '../drawer/Drawer';
import Statistics from './Statistics';
import Authorization from '../../services/Authorization';

class Hangman implements Page {

  private currentWord = 'alcohol';
  private currentWordId = '12315456478751321';
  private currentLetters = '0';
  private currentErrors = 0;
  public async render(): Promise<string> {
    const view = `
      <div class="hangman__wrapper">
        <div class="hangman-settings">
          <p class="form_title">Выберите уровень</p>
          <select class="hangman-level" id="hangman-level">
            <option value="-1" selected>Случайный</option>
            <option value="0">A1</option>
            <option value="1">A2</option>
            <option value="2">B1</option>
            <option value="3">B2</option>
            <option value="4">C1</option>
            <option value="5">C2</option>
          </select>
        </div>
        <div class="hangman">
          <svg width="680" height="350" xmlns="http://www.w3.org/2000/svg" style="border: 1px solid #fff; position: absolute; z-index: -1">
            <g>
                <title>Layer 1</title>
                <line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_1" y2="313.5" x2="71.5" y1="41.5" x1="73.5" stroke-width="1.5" stroke="#fff" fill="none"/> <!-- вертикальная доска -->
                <line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_2" y2="43.5" x2="201.5" y1="42.5" x1="73.5" stroke-width="1.5" stroke="#fff" fill="none"/> <!-- диагональная доска -->
                <line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_3" y2="76.5" x2="73.5" y1="42.5" x1="105.5" stroke-width="1.5" stroke="#fff" fill="none"/> <!-- горизонтальная доска -->
                <line stroke-linecap="undefined" stroke-linejoin="undefined" id="svg_4" y2="88.5" x2="175.5" y1="43.5" x1="175.5" stroke-width="1.5" stroke="#fff" fill="none"/> <!-- веревка -->
                <ellipse ry="23.5" rx="24.5" id="svg_5" cy="110" cx="177" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- голова -->
                <ellipse ry="4.5" rx="5" id="svg_6" cy="104" cx="164.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- левый глаз -->
                <ellipse ry="4.5" rx="5" id="svg_9" cy="104" cx="185.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- правый глаз --> 
                <line stroke-linecap="null" stroke-linejoin="null" id="svg_10" y2="117.5" x2="184.5" y1="117.5" x1="167.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- рот -->
                <ellipse ry="53.5" rx="30" id="svg_11" cy="186" cx="177.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- туловище --> 
                <line stroke-linecap="null" stroke-linejoin="null" id="svg_12" y2="192.5" x2="129.5" y1="153.5" x1="153.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- левая рука --> 
                <line stroke-linecap="null" stroke-linejoin="null" id="svg_14" y2="185.5" x2="226.5" y1="150.5" x1="200.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- правая рука --> 
                <line stroke-linecap="null" stroke-linejoin="null" id="svg_15" y2="282.5" x2="140.5" y1="237.5" x1="171.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- леввая нога --> 
                <line stroke-linecap="null" stroke-linejoin="null" id="svg_16" y2="281.5" x2="207.5" y1="239.5" x1="185.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none" display="none"/> <!-- правая нога --> 
                <line stroke-linecap="null" stroke-linejoin="null" id="svg_17" y2="313.5" x2="265.5" y1="312.5" x1="35.5" fill-opacity="null" stroke-opacity="null" stroke-width="1.5" stroke="#fff" fill="none"/> <!-- нижняя доска -->
            </g>
          </svg>
          <p class="hangman-word"></p>
          <p class="result" id="hangman-result"></p>
          <div class="hangman-buttons">
            <div class="button hangman-new" id="hangman-new" style="display: none">New Game</div>
            <div class="button discover-word" id="discover-word" style="display: none">Discover Word</div>
          </div>
        </div>
        <div class="button hangman-start">Start</div>
        <div class="keyboard" style="display: none">
          <div class="upper-row">
            <div class="letter" id="Q">Q</div>
            <div class="letter" id="W">W</div>
            <div class="letter" id="E">E</div>
            <div class="letter" id="R">R</div>
            <div class="letter" id="T">T</div>
            <div class="letter" id="Y">Y</div>
            <div class="letter" id="U">U</div>
            <div class="letter" id="I">I</div>
            <div class="letter" id="O">O</div>
            <div class="letter" id="P">P</div>
          </div>
          <div class="middle-row">
            <div class="letter" id="A">A</div>
            <div class="letter" id="S">S</div>
            <div class="letter" id="D">D</div>
            <div class="letter" id="F">F</div>
            <div class="letter" id="G">G</div>
            <div class="letter" id="H">H</div>
            <div class="letter" id="J">J</div>
            <div class="letter" id="K">K</div>
            <div class="letter" id="L">L</div>
          </div>
          <div class="lower-row">
            <div class="letter" id="Z">Z</div>
            <div class="letter" id="X">X</div>
            <div class="letter" id="C">C</div>
            <div class="letter" id="V">V</div>
            <div class="letter" id="B">B</div>
            <div class="letter" id="N">N</div>
            <div class="letter" id="M">M</div>
          </div>
        </div>
        <div class="hangman-popup" id="hangman-popup" style="display: none">
          <div class="close">X</div>
        </div>
      </div>
    `;
    return view;
  }

  private async startHangman(): Promise<void> {
    this.currentLetters = '0';
    this.currentErrors = 0;
    (document.getElementById('hangman-result') as HTMLParagraphElement).innerText='';
    (document.getElementById('hangman-new') as HTMLElement).setAttribute('style', 'display: none');
    (document.getElementById('discover-word') as HTMLElement).setAttribute('style', 'display: none');
    document.querySelectorAll('.letter').forEach((el) => el.setAttribute('style', 'background-color:""'));
    (document.querySelector('.hangman-start') as HTMLElement).setAttribute('style', 'display: none');
    (document.querySelector('.keyboard') as HTMLElement).setAttribute('style', 'display: flex');
    const hangman = (document.querySelector('.hangman') as HTMLElement); 
    (hangman.querySelector('#svg_5') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_6') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_9') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_10') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_11') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_12') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_14') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_15') as HTMLElement).setAttribute('display', 'none');
    (hangman.querySelector('#svg_16') as HTMLElement).setAttribute('display', 'none');

    const level = Number((document.getElementById('hangman-level') as HTMLSelectElement).value);
    const groupsPerDictionary = 6;
    const pagesPerGroup = 30;
    const cardsPerPage = 20;
    const group = level === -1 ? Math.round(Math.random()*(groupsPerDictionary-1)): level;
    const page = Math.round(Math.random()*(pagesPerGroup - 1));
    const word = Math.round(Math.random()*(cardsPerPage-1));
    const wordList: Card[] = await Request.getWordsList({group: group, page: page});
    this.currentWord = wordList[word].word.toUpperCase();
    this.currentWordId = wordList[word].id;
    (document.querySelector('.hangman-word') as HTMLParagraphElement).innerText = this.currentWord.replace(/[a-zA-Z]/g,'_ ');
    return;
  }

  public async guessLetter(el:HTMLElement): Promise<void> {
    const dateToday = new Date();
    const date = `${dateToday.getDate().toString().padStart(2, '0')}-${dateToday.getMonth().toString().padStart(2, '0')}-${dateToday.getFullYear()}`;
    let currentId = '';
    let currentToken = '';
    if (Authorization.getInstance().isAuthorized()) {
      const userInfo = Authorization.getInstance().getUserInfo();
      currentId = userInfo.id;
      currentToken = userInfo.token;
    }
    const letter = el.id;
    const hangman = (document.querySelector('.hangman') as HTMLElement); 
    this.currentLetters += letter; 
    const newWord = this.currentWord.replace(new RegExp(`[^${this.currentLetters}]`,'g'), '_ ').trimEnd();
    (document.querySelector('.hangman-word') as HTMLParagraphElement).innerText = newWord;
    if (this.currentWord.includes(letter)) {
      el.style.backgroundColor = 'green';
    } else {
      el.style.backgroundColor = 'red';
      this.currentErrors += 1;
    }
    if (this.currentErrors === 1) {
      (hangman.querySelector('#svg_5') as HTMLElement).removeAttribute('display');
      (hangman.querySelector('#svg_6') as HTMLElement).removeAttribute('display');
      (hangman.querySelector('#svg_9') as HTMLElement).removeAttribute('display');
      (hangman.querySelector('#svg_10') as HTMLElement).removeAttribute('display');
    }
    if (this.currentErrors === 2) {
      (hangman.querySelector('#svg_11') as HTMLElement).removeAttribute('display');
    }
    if (this.currentErrors === 3) {
      (hangman.querySelector('#svg_12') as HTMLElement).removeAttribute('display');
    }
    if (this.currentErrors === 4) {
      (hangman.querySelector('#svg_14') as HTMLElement).removeAttribute('display');
    }
    if (this.currentErrors === 5) {
      (hangman.querySelector('#svg_15') as HTMLElement).removeAttribute('display');
    }
    if (this.currentErrors === 6) {
      const openLetters = (newWord.match(/[A-Z]/g)||[]).length;
      await Statistics.updateStatistics();
      Statistics.data[date].games.hangman.gamescount +=1;
      Statistics.data[date].games.hangman.guess += openLetters;
      Statistics.data[date].games.hangman.total += (openLetters + 6);
      await Request.editStatistics(currentId, currentToken, Statistics.data, Statistics.learnedWords);
      (hangman.querySelector('#svg_16') as HTMLElement).removeAttribute('display');
      (document.getElementById('hangman-result') as HTMLParagraphElement).innerText = `You Lose! \nWord was ${this.currentWord}`;
      (document.getElementById('hangman-new') as HTMLElement).setAttribute('style', 'display: block');
      (document.getElementById('discover-word') as HTMLElement).setAttribute('style', 'display: block');
      (document.querySelector('.keyboard') as HTMLElement).setAttribute('style', 'display: none');
    }
    if (newWord===this.currentWord) {
      await Statistics.updateStatistics();
      Statistics.data[date].games.hangman.gamescount +=1;
      Statistics.data[date].games.hangman.guess += this.currentWord.length;
      Statistics.data[date].games.hangman.total += (this.currentWord.length + this.currentErrors);
      await Request.editStatistics(currentId, currentToken, Statistics.data, Statistics.learnedWords);
      (document.getElementById('hangman-result') as HTMLParagraphElement).innerText = `You Win! \nResult: ${Math.round(100 * this.currentWord.length / (this.currentWord.length + this.currentErrors))}%`;
      (document.getElementById('hangman-new') as HTMLElement).setAttribute('style', 'display: block');
      (document.getElementById('discover-word') as HTMLElement).setAttribute('style', 'display: block');
      (document.querySelector('.keyboard') as HTMLElement).setAttribute('style', 'display: none');
    }
  }

  public async discoverWord(): Promise<void> {
    const res: Card = await Request.getWordById(this.currentWordId);
    (document.getElementById('hangman-popup') as HTMLElement).innerHTML += await Drawer.drawComponent(WordCard, res);
    (document.getElementById('hangman-popup') as HTMLElement).setAttribute('style', 'display: flex');
  } 

  public async after_render(): Promise<void> {
    (document.querySelector('.hangman-start') as HTMLElement).addEventListener('click', () => {this.startHangman()});
    (document.querySelectorAll('.letter') as NodeListOf<HTMLElement>).forEach((el: HTMLElement) => el.addEventListener('click', () => {this.guessLetter(el)}));
    (document.querySelector('#hangman-new') as HTMLElement).addEventListener('click', () => {this.startHangman()});
    
    (document.querySelector('#discover-word') as HTMLElement).addEventListener('click', () => {
      this.discoverWord();
      setTimeout(() => {
        (document.querySelector('.word-card__audio') as HTMLElement).addEventListener('click', (ev: Event)=>{
          const audio_word = (ev.target as HTMLElement).children[0] as HTMLAudioElement;
          const audio_meaning = (ev.target as HTMLElement).children[1] as HTMLAudioElement;
          const audio_example = (ev.target as HTMLElement).children[2] as HTMLAudioElement;
          audio_word.play();
          audio_word.onended = () => {
            audio_meaning.play();
          };
          audio_meaning.onended = () => {
            audio_example.play();
          };
        });
        (document.querySelector('.close') as HTMLElement).addEventListener('click', (ev:Event)=>{
          const popup = ((ev.target as HTMLElement).parentElement as HTMLElement);
          popup.setAttribute('style', 'display: none');
          const wordcard = popup.children[1];
          popup.removeChild(wordcard);
        });
      }, 300);
    });
    
    return;

  }
}

export default Hangman;