import Page from "./Page";

class Error404 implements Page {
  public async render(): Promise<string> {
    const view = `
        <section class="section">
            <h1> 404 Error </h1>
        </section>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default Error404;