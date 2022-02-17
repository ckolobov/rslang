import Timer from '../../services/Timer';

export enum Containers {
  TIMER_CONTAINER_ID = 'timer-container',
  QUESTIONS_CONTAINER_ID = 'question',
  CORRECT_ANSWERS_CONTAINER_ID = 'correct-answers',
  WRONG_ANSWERS_CONTAINER_ID = 'wrong-answers',
}

abstract class GameWidget {
  private timer = new Timer();
  protected timeFinished = false;
  private timerInterval: ReturnType<typeof setInterval> | null = null;

  abstract showStep(stepNumber: number): Promise<void>;

  async showFirsStep(): Promise<void> {
    return await this.showStep(0);
  }

  startTimer(): void {
    const timerContainer: HTMLElement = document.getElementById(
      Containers.TIMER_CONTAINER_ID
    ) as HTMLElement;
    this.timer.start();
    timerContainer.innerHTML = this.timer.getSecondsLeft().toString();
    this.timerInterval = setInterval(() => {
      const secondsLeft = this.timer.getSecondsLeft();
      if (secondsLeft > 0) {
        timerContainer.innerHTML = secondsLeft.toString();
      } else {
        this.stopTimer();
      }
    }, 1000);
  }

  pauseTimer() {
    this.timer.pause();
  }

  continueTimer() {
    this.timer.continue();
  }

  stopTimer() {
    if (this.timerInterval !== null) {
      clearInterval(this.timerInterval);
      this.timeFinished = true;
    }
  }
  
 shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
}

export default GameWidget;
