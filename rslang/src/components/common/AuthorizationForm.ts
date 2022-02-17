import Component from './Component';
import Drawer from '../drawer/Drawer';
import Button from './Button';
import Request from '../../services/Request/Requests';
import Authorization from '../../services/Authorization';
import { createUserErrorCodes, loginUserErrorCodes } from '../../services/Request/RequestErrorCodes';
import '../../scss/components/_authorization-form.scss';

const DEFAULT_USER_NAME = 'user';
interface AuthorizationFormOptions {
  class: string;
  id: string;
}

export const enum ErrorFields {
  EMAIL = 'email-error',
  PASSWORD = 'password-error'
}
class AuthorizationForm implements Component {
  private options: AuthorizationFormOptions;
  private authorization: Authorization;
  private type: 'Sign in' | 'Sign up';
  private action;

  public constructor(options: AuthorizationFormOptions) {
    this.options = options;
    this.authorization = Authorization.getInstance();
    this.type = 'Sign in';
    this.action = this.loginUser;
  }

  private text = {
    'Sign in': ['Sign in', "Don't have an account?", 'Log in'],
    'Sign up': ['Sign up', 'Already have an account?', 'Create an account'],
  };

  public async render(): Promise<string> {
    const authorizationButton = await Drawer.drawComponent(Button, {
      id: 'authorization-form-button',
      class: 'login__button',
      text: `${this.text[this.type][2]}`,
    });
    const view = `
    <div id="${this.options.id ? this.options.id : ''}"
    class="${this.options.class ? this.options.class : ''}">
      <div class="login__body">
        <form class="login__form" novalidate>
          <div class="login__close"></div>
          <h1>${this.type}</h1>
          <div class="login__content">
            <input
              id="email"
              name="email"
              placeholder="email"
              type="email"/>
            <p class="error login__error-text" id="${ErrorFields.EMAIL}"></p>
            <input
              id="password"
              name="password"
              placeholder="password"
              type="password"/>
            <p class="error login__error-text" id="${ErrorFields.PASSWORD}"></p>
              <p class="login__text link">
                ${this.text[this.type][1]}
              </p>
            ${authorizationButton}
          </div>
        </form>
      </div>
    </div>
    `;
    return view;
  }

  private showErrorMessage(
    fieldId: ErrorFields,
    errorText: string
  ) {
    const errorElement: HTMLElement = document.getElementById(fieldId) as HTMLElement;
    errorElement.innerHTML = errorText;
    const input = errorElement.previousElementSibling;
    if (input?.tagName === 'INPUT') {
      input.classList.add('error');
    }
  }

  private changeForm() {
    if (this.type === 'Sign in') {
      this.type = 'Sign up';
      this.action = this.createUser;
    } else {
      this.type = 'Sign in';
      this.action = this.loginUser;
    }
  }

  private async createUser(email: string, password: string): Promise<void> {
    const createResult = await Request.createUser({ name: DEFAULT_USER_NAME, email, password });
    if (createResult.error) {
      if (createResult.error.errors) {
        createResult.error.errors.forEach((err) => {
          const fieldId = err.path[0] === 'email' ? ErrorFields.EMAIL : ErrorFields.PASSWORD;
          this.showErrorMessage(fieldId, err.message);
        });
      } else if (createResult.error.code === createUserErrorCodes.USER_EXISTS) {
        this.showErrorMessage(
          ErrorFields.EMAIL,
          'account with this email already exists'
        );
      }
      return;
    }
    await this.loginUser(email, password);
  }

  private async loginUser(email: string, password: string): Promise<void> {
    const res = await this.authorization.loginUser(email, password);
    if (res.error) {
      switch (res.error.code) {
        case loginUserErrorCodes.WRONG_INPUT:
          this.showErrorMessage(ErrorFields.PASSWORD, 'Wrong password');
          break;
        case loginUserErrorCodes.NOT_FOUND:
          this.showErrorMessage(
            ErrorFields.EMAIL,
            `account with this email doesn't exist.`
          );
          break;
        default:
          this.showErrorMessage(ErrorFields.EMAIL, 'Unknown error!');
      }
    }
  }

  public async after_render(): Promise<void> {
    const formPopup = document.getElementById(this.options.id) as HTMLElement;
    const form = formPopup.querySelector('form') as HTMLFormElement;
    const switchForm = form.querySelector('.login__text') as HTMLElement;
    const title = form.querySelector('H1') as HTMLElement;
    const inputs = formPopup.querySelectorAll(
      'input'
    ) as NodeListOf<HTMLInputElement>;
    const button = document.getElementById(
      'authorization-form-button'
    ) as HTMLButtonElement;

    const closeForm = () => {
      formPopup.classList.remove('active');
    };

    formPopup.addEventListener('click', (ev: MouseEvent) => {
      const el = ev.target as HTMLElement;
      if (
        !el.closest('.login__form') ||
        el.classList.contains('login__close')
      ) {
        closeForm();
      }
    });

    button.addEventListener('click', async (event: MouseEvent) => {
      event.preventDefault();
      const email: string = form.elements['email'].value;
      const password: string = form.elements['password'].value;
      await this.action(email, password);
      if (this.authorization.isAuthorized()) {
        window.location.reload();
      }
    });

    switchForm.addEventListener('click', () => {
      this.changeForm();
      inputs[1].focus();
      inputs[0].focus();
      title.innerHTML = this.type;
      switchForm.innerHTML = this.text[this.type][1];
      button.innerHTML = this.text[this.type][2];
    });

    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        input.classList.remove('error');
        if (input.nextElementSibling) input.nextElementSibling.innerHTML = '';
      });
    });
  }
}

export default AuthorizationForm;
