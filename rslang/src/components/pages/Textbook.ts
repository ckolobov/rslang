import Page from "./Page";

class Textbook implements Page {
  public async render(): Promise<string> {
    const view = `
      <section class="section">
          <h1>Textbook</h1>
      </section>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default Textbook;