import Component from "./Component"
import Drawer from "../drawer/Drawer"
import Button from "./Button"
import "../../scss/components/_authorization-form.scss"

class AuthorizationForm implements Component {
  private class: string
  private id: string

  public constructor(options) {
    this.class = options.class
    this.id = options.id
  }

  public async render(): Promise<string> {
    const authorizationButton = await Drawer.drawComponent(Button, {
      id: "authorization-form-button",
      class: "login__button",
      text: "Log in",
    })
    const view = `
      <div id="${this.id ? this.id : ""}" class="login active ${this.class ? this.class : ""}">
      <div class="login__body">
        <form class="login__form">
          <div class="login__close"></div>
          <h1>Sign in</h1>
          <div class="login__content">
            <input
              id="email"
              name="email"
              placeholder="email"
              type="email"
            /><input
              id="password"
              name="password"
              placeholder="password"
              type="password"
            /><br />
            <p class="login__error-text">Wrong password.</p>
              <p class="login__text">
                If you don't have an account, a new one will be created.
              </p>
            ${authorizationButton}
          </div>
        </form>
      </div>
    </div>
    `
    return view
  }

  public async after_render(): Promise<void> {
    return
  }
}

export default AuthorizationForm
