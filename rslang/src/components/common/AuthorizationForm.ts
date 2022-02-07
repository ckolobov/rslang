import Component from './Component';
import Drawer from '../drawer/Drawer';
import Button from './Button';
import Request from '../../services/Requests';
import '../../scss/components/_authorization-form.scss';

class AuthorizationForm implements Component {
  private class: string;
  private id: string;

  public constructor(options) {
    this.class = options.class;
    this.id = options.id;
  }

  static authorizationInfo = {
    isAuthorized: false,
    token: '',
    refreshToken: '',
    userId: '',
    email: '',
  };

  public async render(): Promise<string> {
    this.getLocalStorage();
    const authorizationButton = await Drawer.drawComponent(Button, {
      id: 'authorization-form-button',
      class: 'login__button',
      text: 'Log in',
    });
    const view = `
    <div id="${this.id ? this.id : ''}" class="${this.class ? this.class : ''}">
      <div class="login__body">
        <form class="login__form" novalidate>
          <div class="login__close"></div>
          <h1>Sign in</h1>
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
              <p class="login__text">
                If you don't have an account, a new one will be created.
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
      Object.assign(AuthorizationForm.authorizationInfo, JSON.parse(userInfo));
    }
  }

  private async loginUser(email: string, password: string): Promise<void> {
    try {
      const res = await Request.loginUser({ email, password });
      AuthorizationForm.authorizationInfo.isAuthorized = true;
      AuthorizationForm.authorizationInfo.refreshToken = res.refreshToken;
      AuthorizationForm.authorizationInfo.token = res.token;
      AuthorizationForm.authorizationInfo.userId = res.userId;
      AuthorizationForm.authorizationInfo.email = email;
      this.setLocalStorage();
      console.log(res);
    } catch (error) {
      const passwordErrorText = document.getElementById('password-error') as HTMLElement;
      if (error == 'SyntaxError: Unexpected token F in JSON at position 0') {
        passwordErrorText.innerHTML = 'Wrong password';
        return;
      }
      const res = await Request.createUser({
        name: 'user',
        email,
        password,
      });
      console.log(res);
      if (res.error) {
        const emailErrorText = document.getElementById('email-error') as HTMLElement;
        res.error.errors.forEach((err) => err.message[1] === 'e' ? (emailErrorText.innerHTML = err.message) : (passwordErrorText.innerHTML = err.message));
        return;
      }
      await this.loginUser(email, password);
    }
  }

  public async after_render(): Promise<void> {
    const formPopup = document.getElementById(this.id) as HTMLElement;
    const form = formPopup.querySelector('form') as HTMLFormElement;
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
      await this.loginUser(email, password);
      if (AuthorizationForm.authorizationInfo.isAuthorized) {
        const button = document.getElementById('authorization-button') as HTMLElement;
        button.innerHTML = 'Log out';
        closeForm();
      }
    });

    inputs.forEach((input) => {
      input.addEventListener('focus', () => {
        if (input.nextElementSibling) input.nextElementSibling.innerHTML = '';
      });
    });
  }
}

export default AuthorizationForm;
