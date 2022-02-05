import Page from "./Page";
import Drawer from "../drawer/Drawer";
import Button from "../common/Button";

class Home implements Page {
  public async render(): Promise<string> {
    const mainButton = await Drawer.drawComponent(Button, {id: 'main_button', class: 'main_button'});

    const view = `
      <section class="section">
          <h1>Home Page</h1>
          ${mainButton}
      </section>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    console.log('home page after render')
    return;
  }
}

export default Home;