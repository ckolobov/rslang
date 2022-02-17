import './audioChallenge.scss';
import Drawer from '../../drawer/Drawer';
import GameWidget from '../GameWidget';
import AudioChallengeFirstStep from './AudioChallengeFirstStep';
import QuestionStepComponents from '../game-sprint/QuestionStepComponent';
import AudioChallengeQuestionStep from './AudioChallengeQuestionStep'
import { Containers } from '../GameWidget';
import Request from '../../../services/Requests';
import GameResultStep from '../GameResultStep';

const enum AudioChallengeSteps {
  FIRST_STEP,
  GAME_QUESTION,
  RESULTS,
}

const enum languageEnum {
   Russian = 'wordTranslate',
   English = 'word',
}

class AudioChallengeWidget extends GameWidget {
  public container: HTMLElement;
  public page: number;
  public group: number;
  private language = 'English';
  private questions: Word[] = [];
  private answersPool: Word[] = [];
  private countWrong = 0;
  private countCorrect = 0;
  private questionContainer: HTMLElement | null = null;
  private correctAnswersContainer: HTMLElement | null = null;
  private wrongAnswersContainer: HTMLElement | null = null;

  constructor(container: HTMLElement, group:number, page: number) {
    super();
    this.container = container;
    this.group = group;
    this.page = page;
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
      onConfirm: async (language) => {
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
    if (this.answersPool.length <= 0 || this.questions.length <=0) {
      this.stopTimer();
      return this.showStep(AudioChallengeSteps.RESULTS);   
    }
    const scenario = Math.floor(Math.random() * 5);
    const word = this.questions.pop();
    const answers = this.answersPool.splice(0, 4);
    if(word) {
      answers.splice(scenario, 0, word);  
    }
    if (!this.questionContainer) {
      throw Error('No question container found');
    }
    if (!word) {
      throw Error('No word for answer');
    }
    return await Drawer.drawBlock(AudioChallengeQuestionStep, this.questionContainer, {
      word: word,
      answers: answers,
      scenario: scenario,
      language: this.language === 'English' ? languageEnum.English : languageEnum.Russian ,
      onConfirm: (result: boolean) => {
        if (!result) {
          this.countWrong += 1;
        } else {
          this.countCorrect += 1;
        }
        this.updateResults();
        if (this.timeFinished) {
          this.showStep(AudioChallengeSteps.RESULTS);
        } else {
          this.showStep(AudioChallengeSteps.GAME_QUESTION);
        }
      },
    });
  }

  private async getResultsStep(): Promise<void> {
    return Drawer.drawBlock(GameResultStep, this.container, {
      correct: this.countCorrect,
      wrong: this.countWrong,
    });
  }

  private async getQuestions(): Promise<void> {
    this.questions = await Request.getWordsList({ page: this.page, group: this.group });
    this.shuffle(this.questions); 
  }

  private async getAnswersPool(): Promise<void> {
    const i: number = (this.page - 4 >= 0) ? (this.page - 4) : (this.page + 1);
    const arr: Promise<any>[] = [];
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