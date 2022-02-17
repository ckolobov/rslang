import Page from './Page';
import '../../scss/layout/_statistics.scss';
import Request from '../../services/Request/Requests';
import Authorization from '../../services/Authorization';

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

    const view = `
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
    `;
    return view;
  }

  static data = {};
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
      Statistics.data = res.optional;
    } finally {
      const date = Statistics.date;
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

  public async after_render(): Promise<void> {
    return;
  }
}

export default Statistics;
