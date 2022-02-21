import './GameResultStep.scss';
import Component from '../common/Component';
import Drawer from '../drawer/Drawer';
import WordResult from './WordResult';
import Statistics from '../pages/Statistics';
import Authorization from '../../services/Authorization';
import Request, { Difficulty } from '../../services/Request/Requests';

interface GameResultStepOptions {
  correct: number;
  wrong: number;
  game: string;
  playerResult: Array<[Word, boolean]>;
}

const wordIsLearned = {
  hard: 5,
  normal: 3,
};

class GameResultStep implements Component {
  private options: GameResultStepOptions;
  private authorization: Authorization;
  private newCount: number;
  private learnCount: number;

  constructor(options: GameResultStepOptions) {
    this.options = options;
    this.authorization = Authorization.getInstance();
    this.newCount = 0;
    this.learnCount = 0;
  }

  public async render(): Promise<string> {
    const arr: Array<Promise<string>> = [];
    this.options.playerResult.forEach((res) =>
      arr.push(
        Drawer.drawComponent(WordResult, {
          word: res[0],
          isGuessed: res[1],
        })
      )
    );
    const results = (await Promise.all(arr)).flat().join('');

    return `
      <h1>Results</h1>
      <div class="results results--correct">Correct: ${this.options.correct}</div>
      <div class="results results--wrong">Wrong: ${this.options.wrong}</div>
      <div class="results-container">${results}</div>
    `;
  }

  private playAudio(event: Event) {
    const audio = (event.target as HTMLElement).closest('.audio');
    if (!audio) return;
    (audio.firstElementChild as HTMLAudioElement).play();
  }

  private async updateGameStatistics() {
    await Statistics.updateStatistics();
    const date = Statistics.getDate();
    Statistics.data[date].games[this.options.game].guess += this.options.correct;
    Statistics.data[date].games[this.options.game].learn += this.learnCount;
    Statistics.data[date].games[this.options.game].new += this.newCount;
    Statistics.data[date].games[this.options.game].total += this.options.playerResult.length;
    let count = 1;
    if (Statistics.data[date].games[this.options.game].row == 0 && this.options.correct > 0) {
      Statistics.data[date].games[this.options.game].row = count;
    }
    for (let i = 0; i < this.options.playerResult.length - 1; i++) {
      if ( this.options.playerResult[i][1] && this.options.playerResult[i + 1][1]) {
        count += 1;
        if (Statistics.data[date].games[this.options.game].row < count) {
          Statistics.data[date].games[this.options.game].row = count;
        }
      } else {
        count = 1;
      }
    }
  }

  private async uppdateWordProgress(id: string, token: string) {
    let wordDiff = 0;
    let correct_in_row = 0;
    let total_correct_sprint = 0;
    let total_wrong_sprint = 0;
    let total_correct_audioChallenge = 0;
    let total_wrong_audioChallenge = 0;
    let total_correct_pexesoOCM = 0;
    let total_wrong_pexesoOCM = 0;

    for (let i = 0; i < this.options.playerResult.length; i++) {
      try {
        const ans = await Request.getWordFromUserWordsList(
          id,
          token,
          this.options.playerResult[i][0].id
        );

        wordDiff = Number(ans.difficulty);
        total_correct_pexesoOCM = Number(ans.optional.correctPexesoOCM);
        total_wrong_pexesoOCM = Number(ans.optional.wrongPexesoOCM);
        if (this.options.playerResult[i][1]) {
          correct_in_row = Number(ans.optional.correctInRow) + 1;
          if ((wordDiff === Number(Difficulty.HARD) && wordIsLearned.hard <= correct_in_row) || (wordDiff === Number(Difficulty.NORMAL) && wordIsLearned.normal <= correct_in_row)) {
            wordDiff = Number(Difficulty.LEARNED);
            correct_in_row = 0;
            this.learnCount += 1;
            console.log('learn');
          }
        } else if (!this.options.playerResult[i][1]) {
          if (wordDiff === Number(Difficulty.LEARNED)) {
            this.learnCount -= 1;
          }
          wordDiff = Number(Difficulty.HARD);
          correct_in_row = 0;
        }

        if (this.options.game === 'sprint') {
          total_correct_audioChallenge = Number(ans.optional.correctTotalAudioChallenge);
          total_wrong_audioChallenge = Number(ans.optional.wrongTotalAudioChallenge);
          if (this.options.playerResult[i][1]) {
            total_correct_sprint = Number(ans.optional.correctTotalSprint) + 1;
            total_wrong_sprint = Number(ans.optional.wrongTotalSprint);
          } else {
            total_correct_sprint = Number(ans.optional.correctTotalSprint);
            total_wrong_sprint = Number(ans.optional.wrongTotalSprint) + 1;
          }
        }

        if (this.options.game === 'audioChallenge') {
          total_correct_sprint = Number(ans.optional.correctTotalSprint);
          total_wrong_sprint = Number(ans.optional.wrongTotalSprint);
          if (this.options.playerResult[i][1]) {
            total_correct_audioChallenge = Number(ans.optional.correctTotalAudioChallenge) + 1;
            total_wrong_audioChallenge = Number(ans.optional.wrongTotalAudioChallenge);
          } else {
            total_correct_audioChallenge = Number(ans.optional.correctTotalAudioChallenge);
            total_wrong_audioChallenge = Number(ans.optional.wrongTotalAudioChallenge) + 1;
          }
        }

        if (!Number(ans.optional.wasInGame)) {
          this.newCount += 1;
          console.log('new');
        }

        await Request.editWordInUserWordsList(
          id,
          token,
          this.options.playerResult[i][0].id,
          wordDiff,
          correct_in_row,
          total_correct_sprint,
          total_wrong_sprint,
          total_correct_audioChallenge,
          total_wrong_audioChallenge,
          total_correct_pexesoOCM,
          total_wrong_pexesoOCM,
          1
        );
      } catch {
        wordDiff = 1;
        correct_in_row = this.options.playerResult[i][1] ? 1 : 0;
        this.newCount += 1;

        if (this.options.game === 'sprint') {
          total_correct_sprint = this.options.playerResult[i][1] ? 1 : 0;
          total_wrong_sprint = this.options.playerResult[i][1] ? 0 : 1;
          total_correct_audioChallenge = 0;
          total_wrong_audioChallenge = 0;
        }

        if (this.options.game === 'audioChallenge') {
          total_correct_audioChallenge = this.options.playerResult[i][1] ? 1 : 0;
          total_wrong_audioChallenge = this.options.playerResult[i][1] ? 0 : 1;
          total_correct_sprint = 0;
          total_wrong_sprint = 0;
        }

        await Request.SetWordInUsersList(
          id,
          token,
          this.options.playerResult[i][0].id,
          wordDiff,
          correct_in_row,
          total_correct_sprint,
          total_wrong_sprint,
          total_correct_audioChallenge,
          total_wrong_audioChallenge,
          total_correct_pexesoOCM,
          total_wrong_pexesoOCM,
          1
        );
      }
    }
  }

  public async after_render(): Promise<void> {
    const container = document.querySelector('.results-container') as HTMLElement;
    container.addEventListener('click', this.playAudio.bind(this));
    if (this.authorization.isAuthorized()) {
      await this.uppdateWordProgress(
        this.authorization.getUserInfo().id,
        this.authorization.getUserInfo().token
      );
      await this.updateGameStatistics();
      await Statistics.saveStatistics();
      console.log('Statistics saved');
    }
  }
}

export default GameResultStep;
