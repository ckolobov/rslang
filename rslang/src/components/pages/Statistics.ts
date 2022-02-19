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

    // 
    const statisticsAllTime = `
    <div id="all_time_statistics_container">
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
    // 
    const statisticsDay = `
    <div id="today_statistics_container">
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
      <div class="button">Statistics today</div>
      <div class="button_grey">Statistics all-time</div>
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
        new: 0,
        guess: 0,
        total: 0,
        learn: 0,
        row: 0,
      },
      audioChallenge: {
        new: 0,
        guess: 0,
        total: 0,
        learn: 0,
        row: 0,
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
    // const sprintPlayedGames: number[] = [];
    for (let i=0; i< dateList.length; i+=1) {
      sprintNewWords.push(currentData[dateList[i]].games.sprint.new);
      sprintGuess.push(currentData[dateList[i]].games.sprint.guess);
      sprintTotal.push(currentData[dateList[i]].games.sprint.total);
      sprintLearnedWords.push(currentData[dateList[i]].games.sprint.learn);
      sprintRow.push(currentData[dateList[i]].games.sprint.row);
      // sprintPlayedGames.push(currentData[dateList[i]].games.sprint.total);
      // sprintNewWords.push(Object.values(currentData)[i].games)
    }
    const parameters = {'dateList': dateList, 'sprintNewWords': sprintNewWords, 'sprintGuess': sprintGuess,
       'sprintTotal': sprintTotal, 'sprintLearnedWords': sprintLearnedWords, 'sprintRow': sprintRow};
    (document.getElementById('all_time_statistics_container') as HTMLElement).innerHTML += await Drawer.drawComponent(Graph, parameters);
  }

  public async after_render(): Promise<void> {
    
    setTimeout(()=> {
      const refreshButton = document.getElementById('stat-refresh') as HTMLElement;
      console.log(refreshButton);
      refreshButton.addEventListener('click', (e:MouseEvent)=> {
        console.log('тест');
        e.preventDefault();
        this.drawGraph()})
    }, 1000);
    return;
  }
}

export default Statistics;
