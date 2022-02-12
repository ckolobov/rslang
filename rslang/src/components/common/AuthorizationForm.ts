import Component from './Component';
import Drawer from '../drawer/Drawer';
import Button from './Button';
import Request from '../../services/Requests';
import '../../scss/components/_authorization-form.scss';

type authorizationType = {
  message: string;
  name: string;
  refreshToken: string;
  token: string;
  userId: string;
};

class AuthorizationForm implements Component {
  private class: string;
  private id: string;
  private type: 'Sign in' | 'Sign up';
  private action;

  public constructor(options) {
    this.class = options.class;
    this.id = options.id;
    this.type = 'Sign in';
    this.action = this.loginUser;
  }

  static isAuthorized = false;
  static authorizationInfo: authorizationType;

  private text = {
    'Sign in': ['Sign in', "Don't have an account?", 'Log in'],
    'Sign up': ['Sign up', 'Already have an account?', 'Create an account'],
  };

  public async render(): Promise<string> {
    this.getLocalStorage();
    const authorizationButton = await Drawer.drawComponent(Button, {
      id: 'authorization-form-button',
      class: 'login__button',
      text: `${this.text[this.type][2]}`,
    });
    const view = `
    <div id="${this.id ? this.id : ''}" class="${this.class ? this.class : ''}">
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
            <p class="error login__error-text" id="email-error"></p>
            <input
              id="password"
              name="password"
              placeholder="password"
              type="password"/>
            <p class="error login__error-text" id="password-error"></p>
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

  private setLocalStorage(): void {
    localStorage.setItem('userInfo', JSON.stringify(AuthorizationForm.authorizationInfo));
  }

  private getLocalStorage(): void {
    const userInfo: string | null = localStorage.getItem('userInfo');
    if (userInfo) {
      AuthorizationForm.authorizationInfo = JSON.parse(userInfo);
      AuthorizationForm.isAuthorized = true;
    }
  }

  private showErrorMessage(id: 'password-error' | 'email-error', errorText: string) {
    const errorElement = document.getElementById(id) as HTMLElement;
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
    try {
      const res = await Request.createUser({name: 'user', email, password});
      if (res.error) {
        res.error.errors.forEach((err) => {
          const id = err.message[1] === 'e' ? 'email-error' : 'password-error';
          this.showErrorMessage(id, err.message);
        });
        return;
      }
      await this.loginUser(email, password);
    } catch(error) {
      if (error == 'SyntaxError: Unexpected token u in JSON at position 0') {
        this.showErrorMessage('email-error', 'account with this email already exists');
      }
    }
  }

  private async loginUser(email: string, password: string): Promise<void> {
    try {
      const res = await Request.loginUser({ email, password });
      AuthorizationForm.isAuthorized = true;
      AuthorizationForm.authorizationInfo = res;
      this.setLocalStorage();
    } catch (error) {
      if (error == 'SyntaxError: Unexpected token F in JSON at position 0') {
        this.showErrorMessage('password-error', 'Wrong password');
      }
      if (error == 'SyntaxError: Unexpected token C in JSON at position 0') {
        this.showErrorMessage('email-error', `account with this email doesn't exist.`);
      }
    }
  }

  public async after_render(): Promise<void> {
    const formPopup = document.getElementById(this.id) as HTMLElement;
    const form = formPopup.querySelector('form') as HTMLFormElement;
    const switchForm = form.querySelector('.login__text') as HTMLElement;
    const title = form.querySelector('H1') as HTMLElement;
    const inputs = formPopup.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    const button = document.getElementById('authorization-form-button') as HTMLButtonElement;

    const closeForm = () => {
      formPopup.classList.remove('active');
    };

    formPopup.addEventListener('click', (ev: MouseEvent) => {
      const el = ev.target as HTMLElement;
      if (!el.closest('.login__form') || el.classList.contains('login__close')) {
        closeForm();
      }
    });

    button.addEventListener('click', async (event: MouseEvent) => {
      event.preventDefault();
      const email: string = form.elements['email'].value;
      const password: string = form.elements['password'].value;
      await this.action(email, password);
      if (AuthorizationForm.isAuthorized) {
        const button = document.getElementById('authorization-button') as HTMLElement;
        button.innerHTML = 'Log out';
        closeForm();
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
