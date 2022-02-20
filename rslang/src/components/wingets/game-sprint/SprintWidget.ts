import './SprintGame.scss';
import Drawer from '../../drawer/Drawer';
import GameWidget from '../GameWidget';
import SprintFirstStep from './SprintFirstStep';
import SprintQuestionStep from './SprintQuestionStep';
import QuestionStepComponents from './QuestionStepComponent';
import { Containers } from '../GameWidget';
import Request from '../../../services/Request/Requests';
import GameResultStep from '../GameResultStep';

const enum SprintSteps {
  FIRST_STEP,
  GAME_QUESTION,
  RESULTS,
}

export const enum Scenario {
  WRONG_TRANSLATION,
  CORRECT_TRANSLATION,
}

export const enum Results {
  WRONG,
  CORRECT,
}

class SprintWidget extends GameWidget {
  public container: HTMLElement;
  private questions: Word[] = [];
  private answersPool: Word[] = [];
  private questionsFinished = false;
  private countWrong = 0;
  private countCorrect = 0;
  private playerResult: Array<[Word, boolean]> = [];
  private questionContainer: HTMLElement | null = null;
  private correctAnswersContainer: HTMLElement | null = null;
  private wrongAnswersContainer: HTMLElement | null = null;

  constructor(container: HTMLElement) {
    super();
    this.container = container;
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
      onConfirm: async () => {
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
        this.showStep(SprintSteps.GAME_QUESTION);
      },
    });
  }

  private async getQuestionStep() {
    if (this.questions.length <= 0) {
      this.pauseTimer();
      await this.getQuestions();
      if (this.questionsFinished) {
        this.stopTimer();
        this.showStep(SprintSteps.RESULTS);
      }
      this.continueTimer();
    }
    const scenario: Scenario = Math.round(Math.random());
    const word = this.questions.pop();
    const wrongAnswer =
      this.answersPool[
        Math.round(Math.random() * (this.answersPool.length - 1))
      ];
    const translation =
      scenario === Scenario.CORRECT_TRANSLATION ? word : wrongAnswer;
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
    this.questions = await Request.getWordsList({ page: 2 });
  }

  private async getAnswersPool(): Promise<void> {
    this.answersPool = await Request.getWordsList({});
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
