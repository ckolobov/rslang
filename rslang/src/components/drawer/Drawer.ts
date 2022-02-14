import Component from '../common/Component';
import Page from '../pages/Page';
import './Drawer.scss';

class Drawer {
  static renderComponentStack: Component[] = [];
  static loader = '<div class="loader"></div>';

  // Use only inside render()
  static async drawComponent<T>(
    componentClass: new (options: T) => Component,
    options: T
  ) {
    const component: Component = new componentClass(options);
    this.renderComponentStack.push(component);
    const result = await component.render();
    return result;
  }

  // Do not use inside render()
  static async drawBlock<T>(
    blockClass: new (options: T) => Component,
    container: HTMLElement,
    options: T
  ) {
    const block: Component = new blockClass(options);
    container.innerHTML = this.loader;
    container.innerHTML = await block.render();
    while (this.renderComponentStack.length) {
      const componentFromStack = this.renderComponentStack.pop();
      if (componentFromStack) {
        await componentFromStack.after_render();
      }
    }
    await block.after_render();
  }

  static async drawPage(page: new () => Page) {
    const content: HTMLElement = document.getElementById('page_container') as HTMLElement;
    await this.drawBlock(page, content, {});
  }
}

export default Drawer;
