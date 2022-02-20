import Page from './Page';
import '../../scss/layout/_statistics.scss';
import Request from '../../services/Request/Requests';
import Authorization from '../../services/Authorization';
import Drawer from '../drawer/Drawer';
import Graph from '../common/Graph';
import * as d3 from 'd3';

class Statistics implements Page {
  private static authorization = Authorization.getInstance();

  public async render(): Promise<string> {
    if (!Statistics.authorization.isAuthorized()) {
      return '<h1>Statistics is available only for authorized users</h1>';
    }
    await Statistics.updateStatistics();
    const date = Statistics.date;
    const sprintAccuracy = Number(Statistics.data[date].games.sprint.total) === 0 ?
    '0%' : ((Statistics.data[date].games.sprint.guess * 100) / Statistics.data[date].games.sprint.total).toFixed(1) + '%';
    const audioChallengeAccuracy = Number(Statistics.data[date].games.audioChallenge.total) === 0 ?
    '0%': ((Statistics.data[date].games.audioChallenge.guess * 100) / Statistics.data[date].games.audioChallenge.total).toFixed(1) + '%';
    const total = { ...Statistics.data[date].games.sprint };
    for (const key in total) {
      total[key] = Number(total[key]) + Number(Statistics.data[date].games.audioChallenge[key]);
    }
    const totalAccuracy = total.total === 0 ? '0%' : ((total.guess * 100) / total.total).toFixed(1) + '%';

    const statisticsAllTime = `
    <div class="stat-container" id="all_time_statistics_container" style="display: none">
      <h1>Statistics for all time</h1>
      <div class="stat-settings">
        <div class="stat-setting-item">
          <p class="form_title">Choose game</p>
          <select class="stat-setting-select" id="stat-level">
            <option value="-1" selected>All games</option>
            <option value="0">Sprint</option>
            <option value="1">Audio Challenge</option>
            <option value="2">Pexeso (open card mode)</option>
            <option value="3">Hangman</option>
            <option value="4">Pexeso (close card mode)</option>
          </select>
        </div>
        <div class="stat-setting-item">
          <p class="form_title">Choose parameter</p>
          <select class="stat-setting-select" id="stat-type">
            <option value="0" selected>Games played</option>
            <option value="1">Words learned</option>
            <option value="2">Success rate</option>
            <option value="3">Correct in a row</option>
            <option value="4">New words</option>
          </select>
        </div>
      </div>
      <div class="stat-refresh button" id="stat-refresh">Refresh</div>
    </div>`;

    const statisticsDay = `
    <div class="stat-container" id="today_statistics_container">
      <h1>Statistics for today</h1>
      <table class="day-statistics-table">
        <thead class="day-statistics-table__head">
          <tr class="table-head">
            <th><div>Game</div></th>
            <th><div>New words</div></th>
            <th><div>Accuracy</div></th>
            <th><div>In a row</div></th>
            <th><div>Learn</div></th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr>
            <td><div>Sprint</div></td>
            <td><div>${Statistics.data[date].games.sprint.new}</div></td>
            <td><div>${sprintAccuracy}</div></td>
            <td><div>${Statistics.data[date].games.sprint.row}</div></td>
            <td><div>${Statistics.data[date].games.sprint.learn}</div></td>
          </tr>
          <tr>
            <td><div >Audio Challenge</div></td>
            <td><div>${Statistics.data[date].games.audioChallenge.new}</div></td>
            <td><div>${audioChallengeAccuracy}</div></td>
            <td><div>${Statistics.data[date].games.audioChallenge.row}</div></td>
            <td><div>${Statistics.data[date].games.audioChallenge.learn}</div></td>
          </tr>
          <tr>
            <td><div>Total</div></td>
            <td><div>${total.new}</div></td>
            <td><div>${totalAccuracy}</div></td>
            <td><div>${Math.max(Statistics.data[date].games.audioChallenge.row, Statistics.data[date].games.sprint.row)}</div></td>
            <td><div >${Number(Statistics.data[date].textbookLearn) + Number(total.learn)}</div></td>
          </tr>
        </tbody>
      </table>
    </div>
    `;
    const view = `
    <div class="statistics-type">
      <div class="button" id="stat-button-today">Statistics today</div>
      <div class="button_grey" id="stat-button-all-time">Statistics all-time</div>
    </div>
    ${statisticsDay}
    ${statisticsAllTime}
    `;
    return view;
  }

  static data = {};
  static learnedWords: number;
  static date;
  static statisticsTemplate = {
    games: {
      sprint: {
        gamescount: 0,
        new: 0,
        guess: 0,
        total: 0,
        learn: 0,
        row: 0,
      },
      audioChallenge: {
        gamescount: 0,
        new: 0,
        guess: 0,
        total: 0,
        learn: 0,
        row: 0,
      },
      pexesoOCM: {
        gamescount: 0,
        new: 0,
        guess: 0,
        total: 0,
        learn: 0,
        row: 0,
      },
      pexesoCCM: {
        gamescount: 0,
        guess: 0,
        total: 0,
      },
      hangman: {
        gamescount: 0,
        guess: 0,
        total: 0,
      },
    },
    textbookLearn: 0,
  };

  static getDate() {
    const date = new Date();
    return `${date.getDate().toString().padStart(2, '0')}-${date.getMonth().toString().padStart(2, '0')}-${date.getFullYear()}`;
  }

  static async updateStatistics() {
    const userInfo = this.authorization.getUserInfo();
    Statistics.date = Statistics.getDate();
    try {
      const res = await Request.getStatistics(
        userInfo.id,
        userInfo.token,
      );
      Statistics.learnedWords = res.learnedWords;
      Statistics.data = res.optional;
    } finally {
      const date = Statistics.date;
      if (Statistics.data == undefined) {
        Statistics.data = {};
        await Statistics.saveStatistics();
      }
      if (Statistics.data[date] == undefined) {
        Statistics.addDayToStatistics(date);
        await Statistics.saveStatistics();
      }
    }
    console.log('Update Statistics');
  }

  static addDayToStatistics(date: string) {
    Statistics.data[date] = {...Statistics.statisticsTemplate};
  }

  static async saveStatistics() {
    const userInfo = this.authorization.getUserInfo();
    await Request.editStatistics(
      userInfo.id,
      userInfo.token,
      Statistics.data
    );
  }

  public async drawGraph() {
    const currentData = Statistics.data;
    const dateList = Object.keys(currentData);
    const sprintNewWords: number[] = [];
    const sprintGuess: number[] = [];
    const sprintTotal: number[] = [];
    const sprintLearnedWords: number[] = [];
    const sprintRow: number[] = [];
    const sprintPlayedGames: number[] = [];
    const audioChallengeNewWords: number[] = [];
    const audioChallengeGuess: number[] = [];
    const audioChallengeTotal: number[] = [];
    const audioChallengeLearnedWords: number[] = [];
    const audioChallengeRow: number[] = [];
    const audioChallengePlayedGames: number[] = [];
    const pexesoOCMNewWords: number[] = [];
    const pexesoOCMGuess: number[] = [];
    const pexesoOCMTotal: number[] = [];
    const pexesoOCMLearnedWords: number[] = [];
    const pexesoOCMRow: number[] = [];
    const pexesoOCMPlayedGames: number[] = [];
    const hangmanGuess: number[] = [];
    const hangmanTotal: number[] = [];
    const hangmanPlayedGames: number[] = [];
    const pexesoCCMGuess: number[] = [];
    const pexesoCCMTotal: number[] = [];
    const pexesoCCMPlayedGames: number[] = [];
    for (let i=0; i< dateList.length; i+=1) {
      sprintNewWords.push(currentData[dateList[i]].games.sprint.new);
      sprintGuess.push(currentData[dateList[i]].games.sprint.guess);
      sprintTotal.push(currentData[dateList[i]].games.sprint.total);
      sprintLearnedWords.push(currentData[dateList[i]].games.sprint.learn);
      sprintRow.push(currentData[dateList[i]].games.sprint.row);
      sprintPlayedGames.push(currentData[dateList[i]].games.sprint.gamescount);
      audioChallengeNewWords.push(currentData[dateList[i]].games.audioChallenge.new);
      audioChallengeGuess.push(currentData[dateList[i]].games.audioChallenge.guess);
      audioChallengeTotal.push(currentData[dateList[i]].games.audioChallenge.total);
      audioChallengeLearnedWords.push(currentData[dateList[i]].games.audioChallenge.learn);
      audioChallengeRow.push(currentData[dateList[i]].games.audioChallenge.row);
      audioChallengePlayedGames.push(currentData[dateList[i]].games.audioChallenge.gamescount);
      pexesoOCMNewWords.push(currentData[dateList[i]].games.pexesoOCM.new);
      pexesoOCMGuess.push(currentData[dateList[i]].games.pexesoOCM.guess);
      pexesoOCMTotal.push(currentData[dateList[i]].games.pexesoOCM.total);
      pexesoOCMLearnedWords.push(currentData[dateList[i]].games.pexesoOCM.learn);
      pexesoOCMRow.push(currentData[dateList[i]].games.pexesoOCM.row);
      pexesoOCMPlayedGames.push(currentData[dateList[i]].games.pexesoOCM.gamescount);
      hangmanGuess.push(currentData[dateList[i]].games.hangman.guess);
      hangmanTotal.push(currentData[dateList[i]].games.hangman.total);
      hangmanPlayedGames.push(currentData[dateList[i]].games.hangman.gamescount);
      pexesoCCMGuess.push(currentData[dateList[i]].games.pexesoCCM.guess);
      pexesoCCMTotal.push(currentData[dateList[i]].games.pexesoCCM.total);
      pexesoCCMPlayedGames.push(currentData[dateList[i]].games.pexesoCCM.gamescount);
    }
    const parameters = {'dateList': dateList, 'sprintNewWords': sprintNewWords, 'sprintGuess': sprintGuess,
       'sprintTotal': sprintTotal, 'sprintLearnedWords': sprintLearnedWords, 'sprintRow': sprintRow, 'sprintPlayedGames': sprintPlayedGames,
       'audioChallengeNewWords': audioChallengeNewWords, 'audioChallengeGuess': audioChallengeGuess, 'audioChallengeTotal': audioChallengeTotal, 
       'audioChallengeLearnedWords': audioChallengeLearnedWords, 'audioChallengeRow': audioChallengeRow, 'audioChallengePlayedGames': audioChallengePlayedGames,
       'pexesoOCMNewWords': pexesoOCMNewWords, 'pexesoOCMGuess': pexesoOCMGuess,
       'pexesoOCMTotal': pexesoOCMTotal, 'pexesoOCMLearnedWords': pexesoOCMLearnedWords, 'pexesoOCMRow': pexesoOCMRow, 'pexesoOCMPlayedGames': pexesoOCMPlayedGames,
       'pexesoCCMGuess': pexesoCCMGuess, 'pexesoCCMTotal': pexesoCCMTotal, 'pexesoCCMPlayedGames': pexesoCCMPlayedGames,
       'hangmanGuess': hangmanGuess, 'hangmanTotal': hangmanTotal, 'hangmanPlayedGames': hangmanPlayedGames};
    // (document.getElementById('all_time_statistics_container') as HTMLElement).innerHTML += await Drawer.drawComponent(Graph, parameters);
    const graph = new Graph(parameters);
    const game_type = (document.getElementById('stat-level') as HTMLSelectElement).value;
    const stat_type = (document.getElementById('stat-type') as HTMLSelectElement).value;
    const render = await graph.render(game_type, stat_type);
    console.log(render);
    // (document.getElementById('all_time_statistics_container') as HTMLElement).append();
  }

  public moveToAllTimeStat():void {
    const statTodayButton = document.getElementById('stat-button-today') as HTMLElement;
    const statAllTimeButton = document.getElementById('stat-button-all-time') as HTMLElement;
    const statTodayContainer = document.getElementById('today_statistics_container') as HTMLElement;
    const statAllTimeContainer = document.getElementById('all_time_statistics_container') as HTMLElement;
    statAllTimeButton.classList.remove('button_grey');
    statAllTimeButton.classList.add('button');
    statTodayButton.classList.add('button_grey');
    statTodayButton.classList.remove('button');
    statTodayContainer.setAttribute('style', 'display: none');
    statAllTimeContainer.setAttribute('style', 'display: flex');
  }

  public moveToTodayStat():void {
    const statTodayButton = document.getElementById('stat-button-today') as HTMLElement;
    const statAllTimeButton = document.getElementById('stat-button-all-time') as HTMLElement;
    const statTodayContainer = document.getElementById('today_statistics_container') as HTMLElement;
    const statAllTimeContainer = document.getElementById('all_time_statistics_container') as HTMLElement;
    statAllTimeButton.classList.add('button_grey');
    statAllTimeButton.classList.remove('button');
    statTodayButton.classList.remove('button_grey');
    statTodayButton.classList.add('button');
    statTodayContainer.setAttribute('style', 'display: flex');
    statAllTimeContainer.setAttribute('style', 'display: none');
  }

  public updateStatType(): void {
    const statLevel = document.getElementById('stat-level') as HTMLSelectElement;
    const statType = document.getElementById('stat-type') as HTMLSelectElement;
    if (Number(statLevel.value) > 2) {
      statType.innerHTML = `<option value="0" selected>Games played</option>
      <option value="2">Success rate</option>`
    }  else {
      statType.innerHTML = `<option value="0">Games played</option>
      <option value="1">Words learned</option>
      <option value="2">Success rate</option>
      <option value="3">Correct in a row</option>
      <option value="4">New words</option>`
    }
  }

  public async after_render(): Promise<void> {
    setTimeout(()=> {
      const refreshButton = document.getElementById('stat-refresh') as HTMLElement;
      const statTodayButton = document.getElementById('stat-button-today') as HTMLElement;
      const statAllTimeButton = document.getElementById('stat-button-all-time') as HTMLElement;
      const statLevel = document.getElementById('stat-level') as HTMLSelectElement;
      refreshButton.addEventListener('click', ()=> {this.drawGraph()})
      statTodayButton.addEventListener('click', this.moveToTodayStat);
      statAllTimeButton.addEventListener('click', this.moveToAllTimeStat);
      statLevel.addEventListener('blur', this.updateStatType);
    }, 1000);
    return;
  }
}

export default Statistics;
