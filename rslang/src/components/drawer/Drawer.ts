import Component from "../common/Component";
import Page from "../pages/Page";

class Drawer {
  static renderComponentStack: Component[] = [];

  static async drawComponent(componentClass: new (options) => Component, options = {}) {
    const component: Component = new componentClass(options);
    this.renderComponentStack.push(component);
    const result = await component.render();
    return result;
  }

  static async drawPage(page: Page) {
    const content: HTMLElement = (document.getElementById('page_container') as HTMLElement);
    content.innerHTML = await page.render();
    while (this.renderComponentStack.length) {
      const componentFromStack = this.renderComponentStack.pop();
      if (componentFromStack) {
        await componentFromStack.after_render();
      }
    }
    await page.after_render();
  }
}

export default Drawer
