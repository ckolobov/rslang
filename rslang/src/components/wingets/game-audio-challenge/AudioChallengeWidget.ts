import './audioChallenge.scss';
import Drawer from '../../drawer/Drawer';
import GameWidget from '../GameWidget';
import AudioChallengeFirstStep from './AudioChallengeFirstStep';
import QuestionStepComponents from '../game-sprint/QuestionStepComponent';
import AudioChallengeQuestionStep from './AudioChallengeQuestionStep'
import { Containers } from '../GameWidget';
import Request, { Difficulty } from '../../../services/Request/Requests';
import GameResultStep from '../GameResultStep';
import Authorization from '../../../services/Authorization';
import Utils from '../../../services/Utils';
import settings from '../../app/settings';

const enum AudioChallengeSteps {
  FIRST_STEP,
  GAME_QUESTION,
  RESULTS,
}

const enum languageEnum {
   Russian = 'wordTranslate',
   English = 'word',
}

export const enum GameScenario {
  FROM_MAIN_MENU,
  FROM_TEXTBOOK_PAGE,
}
class AudioChallengeWidget extends GameWidget {
  public container: HTMLElement;
  private language = 'English';
  private questions: Word[] = [];
  private answersPool: Word[] = [];
  private countWrong = 0;
  private countCorrect = 0;
  private playerResult: Array<[Word, boolean]> = [];
  private questionContainer: HTMLElement | null = null;
  private correctAnswersContainer: HTMLElement | null = null;
  private wrongAnswersContainer: HTMLElement | null = null;
  private authorization: Authorization;
  private gameScenario: GameScenario;
  private group: number;
  private page: number;
  private questionsFinished = false;

  constructor(container: HTMLElement) {
    super();
    this.container = container;
    const url = Utils.parseRequestURL();
    this.gameScenario = url.id && url.verb ? GameScenario.FROM_TEXTBOOK_PAGE : GameScenario.FROM_MAIN_MENU;
    this.group = url.id ? Number(url.id) : 0;
    this.page = url.verb ? Number(url.verb) : 0;
    this.authorization = Authorization.getInstance();
    if (this.gameScenario === GameScenario.FROM_TEXTBOOK_PAGE && !this.authorization.isAuthorized()) {
      throw new Error('User is not authorized');
    }
  }

  public async showStep(stepNumber: number): Promise<void> {
    switch (stepNumber) {
      case AudioChallengeSteps.FIRST_STEP:
        return await this.getFirstStep();
      case AudioChallengeSteps.GAME_QUESTION:
        return this.getQuestionStep();
      case AudioChallengeSteps.RESULTS:
        return this.getResultsStep();
      default:
        throw new Error('No such step in audioChallengeWidget');
    }
  }

  private async getFirstStep(): Promise<void> {
    return await Drawer.drawBlock(AudioChallengeFirstStep, this.container, {
      gameScenario: this.gameScenario,
      onConfirm: async (language, group) => {
        if (this.gameScenario === GameScenario.FROM_MAIN_MENU) {
          this.group = group === -1 ? Math.round(Math.random() * (settings.GROUPS_AMOUNT - 1)) : group;
          this.page = Math.round(Math.random() * (settings.PAGES_AMOUNT - 1));
        }
        this.language = language;
        await Drawer.drawBlock(QuestionStepComponents, this.container, {
          timerContainer: Containers.TIMER_CONTAINER_ID,
          questionsContainer: Containers.QUESTIONS_CONTAINER_ID,
          correctAnswersContainer: Containers.CORRECT_ANSWERS_CONTAINER_ID,
          wrongAnswersContainer: Containers.WRONG_ANSWERS_CONTAINER_ID,
        });
        this.questionContainer = document.getElementById(
          Containers.QUESTIONS_CONTAINER_ID
        );
        this.correctAnswersContainer = document.getElementById(
          Containers.CORRECT_ANSWERS_CONTAINER_ID
        );
        this.wrongAnswersContainer = document.getElementById(
          Containers.WRONG_ANSWERS_CONTAINER_ID
        );
        this.updateResults();
        await this.getQuestions();
        await this.getAnswersPool();
        this.startTimer();
        this.showStep(AudioChallengeSteps.GAME_QUESTION);
      },
    });
  }

  private async getQuestionStep() {
    if (this.questions.length <= 0) {
      if (this.gameScenario === GameScenario.FROM_MAIN_MENU) {
        this.stopTimer();
        return await this.showStep(AudioChallengeSteps.RESULTS);
      } else {
        this.pauseTimer();
        await this.getQuestions();
        if (this.questionsFinished) {
          this.stopTimer();
          return await this.showStep(AudioChallengeSteps.RESULTS);
        }
        this.continueTimer();
      }
    }
    const scenario = Math.floor(Math.random() * 5);
    const word = this.questions.pop();
    if (!word) {
      throw Error('No word for answer');
    }
    if (this.answersPool.length < 5) {
      this.pauseTimer();
      await this.getAnswersPool();
      this.continueTimer();
    }
    const answers = this.getAnswers(word, scenario);
    if (!this.questionContainer) {
      throw Error('No question container found');
    }
    this.continueTimer();
    return await Drawer.drawBlock(AudioChallengeQuestionStep, this.questionContainer, {
      word: word,
      answers: answers,
      scenario: scenario,
      language: this.language === 'English' ? languageEnum.English : languageEnum.Russian ,
      onConfirm: () => {
        if (this.timeFinished) {
          this.showStep(AudioChallengeSteps.RESULTS);
        } else {
          this.showStep(AudioChallengeSteps.GAME_QUESTION);
        }
      },
      onAnswer: (result: boolean) => {
        this.pauseTimer();
        this.playerResult.push([word, result]);
        if (!result) {
          this.countWrong += 1;
        } else {
          this.countCorrect += 1;
        }
        this.updateResults();
      }
    });
  }

  private getAnswers(word: Word, scenario: number) {
    const wordId = word.id || word._id;
    const answers = this.answersPool.splice(0, 4);
    const wordInAnswers = answers.find((answer) => answer.id === wordId);
    if (wordInAnswers) {
      const newAnswer = this.answersPool.pop();
      if (newAnswer) {
        const index = answers.indexOf(wordInAnswers);
        answers.splice(index, 1, newAnswer);
      }
    }
    answers.splice(scenario, 0, word);
    return answers;
  }

  private async getResultsStep(): Promise<void> {
    return Drawer.drawBlock(GameResultStep, this.container, {
      correct: this.countCorrect,
      wrong: this.countWrong,
      game: 'audioChallenge',
      playerResult: this.playerResult,
    });
  }

  private async getQuestions(): Promise<void> {
    if (this.gameScenario === GameScenario.FROM_MAIN_MENU) {
      const words = await Request.getWordsList({ group: this.group, page: this.page });
      this.shuffle(words);
      this.questions = words;
    } else if (this.gameScenario === GameScenario.FROM_TEXTBOOK_PAGE) {
      if (this.page < 0) {
        this.questionsFinished = true;
        return;
      }
      const userInfo = this.authorization.getUserInfo();
      const filter = {
        $and: [
          {
            $or: [
              {'userWord.difficulty': Difficulty.NORMAL.toString()},
              {'userWord.difficulty': Difficulty.HARD.toString()}
            ]
          },
          {
            'page': this.page
          },
          {
            'group': this.group
          }
        ]
      }
      const aggregatedWords = await Request.getAggregatedWordsList({
        id: userInfo.id,
        token: userInfo.token,
        group: this.group,
        wordsPerPage: 20,
        filter: JSON.stringify(filter),
      });
      let words = aggregatedWords[0].paginatedResults;
      if (words.length === 0) {
        const aggregatedWords = await Request.getAggregatedWordsList({
          id: userInfo.id,
          token: userInfo.token,
          group: this.group,
          filter: `{"page":"${this.page}"}`
        })
        words = aggregatedWords[0].paginatedResults;
        if (words.length === 0) {
          words = await Request.getWordsList({group: this.group, page: this.page});
        } else {
          this.page -= 1;
          return await this.getQuestions();
        }
      }

      this.page -= 1;
      this.shuffle(words);
      this.questions = words;
    } else {
      throw new Error('Unknown game scenario!');
    }
  }

  private async getAnswersPool(): Promise<void> {
    const page = Math.round(Math.random() * (settings.PAGES_AMOUNT - 1));
    const i: number = (page - 4 >= 0) ? (page - 4) : (page + 1);
    const arr: Promise<Word>[] = [];
    for (let j = 0; j < 4; j++) {
      arr.push(Request.getWordsList({page: i+j, group: this.group}))
    }
    this.answersPool = (await Promise.all(arr)).flat();
    this.shuffle(this.answersPool);
  }

  private updateResults(): void {
    if (!this.correctAnswersContainer || !this.wrongAnswersContainer) {
      throw new Error('No result containers found');
    }
    this.correctAnswersContainer.innerHTML = this.countCorrect.toString();
    this.wrongAnswersContainer.innerHTML = this.countWrong.toString();
  }
}

export default AudioChallengeWidget;