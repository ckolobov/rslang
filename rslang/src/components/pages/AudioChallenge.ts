import Page from './Page';
import AudioChallengeWidget from '../wingets/game-audio-challenge/AudioChallengeWidget';

const AUDIO_CHALLENGE_WIDGET_CONTAINER_ID = 'audio-challenge-container';
class AudioChallenge implements Page {
  public async render(): Promise<string> {
    const view = `
      <section class="section">
        <div class="${AUDIO_CHALLENGE_WIDGET_CONTAINER_ID}" id="${AUDIO_CHALLENGE_WIDGET_CONTAINER_ID}">
      </section>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    const AudioChallengeWidgetContainer = document.getElementById(
      AUDIO_CHALLENGE_WIDGET_CONTAINER_ID
    ) as HTMLElement;
    const widget = new AudioChallengeWidget(AudioChallengeWidgetContainer);
    await widget.showFirsStep();
  }
}

export default AudioChallenge;
