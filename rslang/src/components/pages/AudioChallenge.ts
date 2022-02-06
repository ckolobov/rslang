import Page from './Page';

class AudioChallenge implements Page {
  public async render(): Promise<string> {
    const view = `
      <section class="section">
          <h1>Audio Challenge</h1>
      </section>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default AudioChallenge;