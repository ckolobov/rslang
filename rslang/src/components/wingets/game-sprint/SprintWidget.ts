import './SprintGame.scss';
import Drawer from '../../drawer/Drawer';
import GameWidget from '../GameWidget';
import SprintFirstStep from './SprintFirstStep';
import SprintQuestionStep from './SprintQuestionStep';
import QuestionStepComponents from './QuestionStepComponent';
import { Containers } from '../GameWidget';
import Request, { Difficulty } from '../../../services/Request/Requests';
import GameResultStep from '../GameResultStep';
import Utils from '../../../services/Utils';
import settings from '../../app/settings';
import Authorization from '../../../services/Authorization';

const enum SprintSteps {
  FIRST_STEP,
  GAME_QUESTION,
  RESULTS,
}

export const enum QuestionScenario {
  WRONG_TRANSLATION,
  CORRECT_TRANSLATION,
}

export const enum Results {
  WRONG,
  CORRECT,
}

export const enum GameScenario {
  FROM_MAIN_MENU,
  FROM_TEXTBOOK_PAGE,
}
class SprintWidget extends GameWidget {
  public container: HTMLElement;
  private authorization: Authorization;
  private questions: Word[] = [];
  private answersPool: Word[] = [];
  private questionsFinished = false;
  private countWrong = 0;
  private countCorrect = 0;
  private playerResult: Array<[Word, boolean]> = [];
  private questionContainer: HTMLElement | null = null;
  private correctAnswersContainer: HTMLElement | null = null;
  private wrongAnswersContainer: HTMLElement | null = null;
  private gameScenario: GameScenario;
  private group: number;
  private page: number;

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
      case SprintSteps.FIRST_STEP:
        return await this.getFirstStep();
      case SprintSteps.GAME_QUESTION:
        return this.getQuestionStep();
      case SprintSteps.RESULTS:
        return this.getResultsStep();
      default:
        throw new Error('No such step in SprintWidget');
    }
  }

  private async getFirstStep(): Promise<void> {
    return await Drawer.drawBlock(SprintFirstStep, this.container, {
      gameScenario: this.gameScenario,
      onConfirm: async (group: number) => {
        if (this.gameScenario === GameScenario.FROM_MAIN_MENU) {
          this.group = group === -1 ? Math.round(Math.random() * (settings.GROUPS_AMOUNT - 1)) : group;
          this.page = Math.round(Math.random() * (settings.PAGES_AMOUNT - 1));
        }
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
        await this.getAnswersPool();
        this.startTimer();
        await this.showStep(SprintSteps.GAME_QUESTION);
      },
    });
  }

  private async getQuestionStep() {
    if (this.questions.length <= 0) {
      this.pauseTimer();
      await this.getQuestions();
      if (this.questionsFinished) {
        this.stopTimer();
        return await this.showStep(SprintSteps.RESULTS);
      }
      this.continueTimer();
    }
    const scenario: QuestionScenario = Math.round(Math.random());
    const word = this.questions.pop();
    if (!word) {
      throw new Error('Word for question is undefined');
    }
    const wrongAnswer = await this.getWrongAnswer(word);
    const translation =
      scenario === QuestionScenario.CORRECT_TRANSLATION ? word : wrongAnswer;
    if (!this.questionContainer) {
      throw Error('No question container found');
    }
    if (!word || !translation) {
      throw Error('No word for answer or question');
    }
    return await Drawer.drawBlock(SprintQuestionStep, this.questionContainer, {
      word: word,
      translation: translation,
      scenario: scenario,
      onConfirm: (result: Results) => {
        this.playerResult.push([word, Boolean(result)]);
        if (result === Results.WRONG) {
          this.countWrong += 1;
        } else {
          this.countCorrect += 1;
        }
        this.updateResults();
        if (this.timeFinished) {
          this.showStep(SprintSteps.RESULTS);
        } else {
          this.showStep(SprintSteps.GAME_QUESTION);
        }
      },
    });
  }

  private async getResultsStep(): Promise<void> {
    return Drawer.drawBlock(GameResultStep, this.container, {
      correct: this.countCorrect,
      wrong: this.countWrong,
      game: 'sprint',
      playerResult: this.playerResult,
    });
  }

  private async getQuestions(): Promise<void> {
    if (this.gameScenario === GameScenario.FROM_MAIN_MENU) {
      if (this.page < 0) {
        this.page = settings.PAGES_AMOUNT - 1;
      }
      const words = await Request.getWordsList({ group: this.group, page: this.page });
      this.page -= 1;
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
    this.pauseTimer();
    const randomPage = Math.round(Math.random() * (settings.PAGES_AMOUNT - 1));
    this.answersPool = await Request.getWordsList({group: this.group, page: randomPage});
    this.continueTimer();
  }

  private async getWrongAnswer(correct: Word): Promise<Word> {
    if (this.answersPool.length <= 0) {
      await this.getAnswersPool();
    }
    const randomPosition = Math.round(Math.random() * (this.answersPool.length - 1));
    const wrong = this.answersPool.splice(randomPosition, 1)[0];
    const wrongId = wrong.id || wrong._id;
    const correctId = correct.id || correct._id;
    if (wrongId === correctId) {
      return this.answersPool.splice(randomPosition, 1)[0];
    }
    return wrong;
  }

  private updateResults(): void {
    if (!this.correctAnswersContainer || !this.wrongAnswersContainer) {
      throw new Error('No result containers found');
    }
    this.correctAnswersContainer.innerHTML = this.countCorrect.toString();
    this.wrongAnswersContainer.innerHTML = this.countWrong.toString();
  }
}

export default SprintWidget;
