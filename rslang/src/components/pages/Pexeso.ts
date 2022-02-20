import Page from './Page';
import '../../scss/layout/_pexeso.scss';
import Drawer from '../drawer/Drawer';
import PexesoCard from '../common/PexesoCard';
import Request, { Difficulty } from '../../services/Request/Requests';
import Utils from '../../services/Utils';
import Statistics from './Statistics';
import Authorization from '../../services/Authorization';

class Pexeso implements Page {
  private currentClick = 0;
  private currentAttempt = 0;
  private wordsNew = 0;
  private learned = 0;
  private rowCorrect = 0;
  private startTime = new Date();
  
  public async render(): Promise<string> {
    let result = '';
    for (let i = 0; i < 40; i += 1) {
      result += await Drawer.drawComponent(PexesoCard, {id: '123', word: '.', type: 0});
    }

    const view = `
      <div class="pexeso__wrapper">
        <div class="pexeso-settings">
          <div class="pexeso-setting-item">
            <p class="form_title">Выберите уровень</p>
            <select class="pexeso-setting-select" id="pexeso-level">
              <option value="-1" selected>Случайный</option>
              <option value="0">A1</option>
              <option value="1">A2</option>
              <option value="2">B1</option>
              <option value="3">B2</option>
              <option value="4">C1</option>
              <option value="5">C2</option>
            </select>
          </div>
          <div class="pexeso-setting-item">
            <p class="form_title">Выберите формат</p>
            <select class="pexeso-setting-select" id="pexeso-type">
              <option value="0" selected>Карточки закрыты</option>
              <option value="1">Карточки открыты</option>
            </select>
          </div>
        </div>
        <div class="battlefield" id="battlefield" style="pointer-events: none">
            ${result}
            <p class="pexeso-result" id="pexeso-result" style="display: none"></p>
        </div>
        <div class="button pexeso-start">Start</div>
      </div>
    `;
    return view;
  }
  
  private async startPexeso(): Promise<void> {
    this.startTime = new Date();
    (document.getElementById('battlefield') as HTMLElement).setAttribute('style', 'pointer-events: ""');
    (document.getElementById('pexeso-result') as HTMLParagraphElement).setAttribute('style', 'display: none');
    (document.querySelector('.pexeso-start') as HTMLElement).setAttribute('style', 'display: none');
    this.currentClick = 0;
    this.wordsNew = 0;
    this.rowCorrect = 0;
    this.learned = 0;
    this.currentAttempt = 0;
    const level = Number((document.getElementById('pexeso-level') as HTMLSelectElement).value);
    const groupCount = 6;
    const pageCount = 30;
    const group = level === -1 ? Math.round(Math.random()*(groupCount - 1)): level;
    const page = Math.round(Math.random()*(pageCount - 1));
    const type = Number((document.getElementById('pexeso-type') as HTMLSelectElement).value);
    const cards = document.querySelectorAll('.flipper') as NodeListOf<HTMLElement>;
    const wordList = await Request.getWordsList({group: group, page: page});
    const allWordList: string[] = [];
    const allIdList: string[] = [];
    for ( let i = 0; i < wordList.length; i += 1) {
      allWordList.push(wordList[i].word);
      allWordList.push(wordList[i].wordTranslate);
      allIdList.push(wordList[i].id);
      allIdList.push(wordList[i].id);
    }
    const additional: {word: string, id: string}[] = [];
    for (let i=0; i<allWordList.length; i+=1) {
      additional.push({word: allWordList[i], id: allIdList[i]});
    }
    const newAdditional = Utils.randomizeArray(additional);
    for (let j = 0; j < newAdditional.length; j += 1) {
      allWordList[j] = newAdditional[j].word;
      allIdList[j] = newAdditional[j].id;
    }
    cards.forEach((el,i) => {
      el.classList.remove('pexeso-correct');
      el.setAttribute('style','pointer-events: ""; background: grey');
      el.setAttribute('class', `flipper ${allIdList[i]}`);
      (el.children[0] as HTMLElement).innerText = type === 1 ? allWordList[i] : '';
      (el.children[1] as HTMLElement).innerText = type === 1 ? '' : allWordList[i];
    })
    return;
  }

  public async checkCard(el: HTMLElement): Promise<void> {
    this.currentClick += 1;
    const showTime = 1000;
    const dateToday = new Date();
    const date = `${dateToday.getDate().toString().padStart(2, '0')}-${dateToday.getMonth().toString().padStart(2, '0')}-${dateToday.getFullYear()}`;
    let currentId = '';
    let currentToken = '';
    if (Authorization.getInstance().isAuthorized()) {
      const userInfo = Authorization.getInstance().getUserInfo();
      currentId = userInfo.id;
      currentToken = userInfo.token;
    }
    el.setAttribute('style','pointer-events: none; background: red');
    const type = Number((document.getElementById('pexeso-type') as HTMLSelectElement).value);
    el.classList.add(`${type === 0 ? 'flipper-active' : 'flipper-inactive'}`);
    el.classList.add('aim');
    if (this.currentAttempt === 1) {
      (document.querySelector('.battlefield') as HTMLElement).setAttribute('style', 'pointer-events: none');
      setTimeout(()=>(document.querySelector('.battlefield') as HTMLElement).setAttribute('style', 'pointer-events: ""'), showTime);
      const card1 = document.querySelectorAll('.aim')[0] as HTMLElement;
      const card2 = document.querySelectorAll('.aim')[1] as HTMLElement;
      if (card1.classList.value === card2.classList.value) {
        if (type === 1){
          const wordId = card1.classList.value.split(' ')[1];
          const res = await Request.getWordFromUserWordsList(currentId, currentToken, wordId);
          if (!res.error) {          
            const diff = ((Number(res.difficulty) === 0) || (Number(res.difficulty) === 1 && res.optional.correctInRow > 2) || (Number(res.difficulty) === 2 && res.optional.correctInRow > 4)) ? Difficulty.LEARNED:
            (Number(res.difficulty) === 2 && res.optional.correctInRow < 4) ? Difficulty.HARD: Difficulty.NORMAL;
            if((Number(res.difficulty) !== 0) && (diff === Difficulty.LEARNED)) this.learned += 1;
            const correct = Number(res.optional.correctTotalPexesoOCM) + 1;
            if (!res.optional.wasInGame) this.wordsNew += 1;
            await Request.editWordInUserWordsList(currentId, currentToken, wordId, diff, Number(res.optional.correctInRow) + 1, res.optional.correctTotalSprint, res.optional.wrongTotalSprint, res.optional.correctTotalAudioChallenge, res.optional.wrongTotalAudioChallenge, correct, res.optional.wrongTotalPexesoOCM, true);
          } else {
            await Request.SetWordInUsersList(currentId, currentToken, wordId, Difficulty.NORMAL, 1, 0, 0, 0, 0, 1, 0, true);
            this.wordsNew += 1;
          }
        }
        card1.innerHTML = `<div class="front-card"></div><div class="back-card"></div>`;
        card2.innerHTML = `<div class="front-card"></div><div class="back-card"></div>`;
        card1.classList.add('pexeso-correct');
        card2.classList.add('pexeso-correct');
        this.rowCorrect += 1;
      } else {
        if (type === 1){
          const wordId1 = card1.classList.value.split(' ')[1];
          const wordId2 = card2.classList.value.split(' ')[1];
          const res1 = await Request.getWordFromUserWordsList(currentId, currentToken, wordId1);
          if(!res1.error) {
            if (!res1.optional.wasInGame) this.wordsNew += 1;
            if (Number(res1.difficulty) === Difficulty.LEARNED) this.learned -=1;
            await Request.editWordInUserWordsList(currentId, currentToken, wordId1, Difficulty.HARD, 0, res1.optional.correctTotalSprint, res1.optional.wrongTotalSprint, res1.optional.correctTotalAudioChallenge, res1.optional.wrongTotalAudioChallenge, res1.optional.correctTotalPexesoOCM, Number(res1.optional.wrongTotalPexesoOCM) + 1, true);
          } else {
            this.wordsNew += 1;
            await Request.SetWordInUsersList(currentId, currentToken, wordId1, Difficulty.HARD, 0, 0, 0, 0, 0, 0, 1, true);
          }
          const res2 = await Request.getWordFromUserWordsList(currentId, currentToken, wordId2);
          if(!res2.error) {
            if (!res2.optional.wasInGame) this.wordsNew += 1;
            if (Number(res2.difficulty) === Difficulty.LEARNED) this.learned -=1;
            await Request.editWordInUserWordsList(currentId, currentToken, wordId2, Difficulty.HARD, 0, res2.optional.correctTotalSprint, res2.optional.wrongTotalSprint, res2.optional.correctTotalAudioChallenge, res2.optional.wrongTotalAudioChallenge, res2.optional.correctTotalPexesoOCM, Number(res2.optional.wrongTotalPexesoOCM) + 1, true);
          } else {
            this.wordsNew += 1;
            await Request.SetWordInUsersList(currentId, currentToken, wordId2, Difficulty.HARD, 0, 0, 0, 0, 0, 0, 1, true);
          }
        }
        setTimeout(()=>{card1.setAttribute('style','pointer-events: ""; background: grey')}, showTime);
        setTimeout(()=>{card2.setAttribute('style','pointer-events: ""; background: grey')}, showTime);
        this.rowCorrect = 0
      }
      this.currentAttempt = 0;
      setTimeout(()=>{card1.classList.remove('aim', 'flipper-active','flipper-inactive')}, showTime);
      setTimeout(()=>{card2.classList.remove('aim', 'flipper-active','flipper-inactive')}, showTime);
      if ((document.querySelector('.battlefield') as HTMLElement).innerText.length === 0) {
        const finishTime= Date.parse((new Date()).toString());
        const startTime = Date.parse(this.startTime.toString());
        const result = new Date(finishTime-startTime);
        const finalResult = `${(result.getHours()-3).toString().padStart(2,"0")}:${result.getMinutes().toString().padStart(2,"0")}:${result.getSeconds().toString().padStart(2,"0")}`;
        const successRate = Math.round(100 * 40 / this.currentClick);
        const resultField = (document.getElementById('pexeso-result') as HTMLParagraphElement);
        await Statistics.updateStatistics();
        if (type===0){
          Statistics.data[date].games.pexesoCCM.gamescount +=1;
          Statistics.data[date].games.pexesoCCM.guess +=40;
          Statistics.data[date].games.pexesoCCM.total += this.currentClick;
        }
        if (type===1){
          Statistics.learnedWords += this.learned;
          Statistics.data[date].games.pexesoOCM.learn += this.learned;
          Statistics.data[date].games.pexesoOCM.new += this.wordsNew;
          Statistics.data[date].games.pexesoOCM.row = this.rowCorrect > Number(Statistics.data[date].games.pexesoOCM.row) ? this.rowCorrect: Number(Statistics.data[date].games.pexesoOCM.row);
          Statistics.data[date].games.pexesoOCM.gamescount +=1;
          Statistics.data[date].games.pexesoOCM.guess +=40;
          Statistics.data[date].games.pexesoOCM.total += this.currentClick;
        }
        await Request.editStatistics(currentId, currentToken, Statistics.data, Statistics.learnedWords);
        
        resultField.setAttribute('style', 'display: block');
        resultField.innerText = `
          You Win! \n
          Result: ${finalResult}\n
          Rate: ${successRate}%\n
          ${successRate<80 && type === 1 ? 'Для игры в открытую результат так себе':
          successRate<40 && type === 0 ? 'Даже для игры взакрытую результат так себе': 'Отличный результат!'}`;
          (document.querySelector('.pexeso-start') as HTMLElement).setAttribute('style', 'display: block');
      }
    } else {
      this.currentAttempt = 1;
    }
  }

  public async after_render(): Promise<void> {
    const startButton = document.querySelector('.pexeso-start') as HTMLElement;
    startButton.addEventListener('click', () => {this.startPexeso()});
    const cards = document.querySelectorAll('.flipper') as NodeListOf<HTMLElement>;
    cards.forEach((el) => {
      el.addEventListener('click', () => {this.checkCard(el)});
    })
    return;

  }
}

export default Pexeso;