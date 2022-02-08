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
    isAuthorized: false
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

  private showErrorMessage(id: 'password-error' | 'email-error', errorText: string) {
    const errorElement = document.getElementById(id) as HTMLElement;
    errorElement.innerHTML = errorText;
  }

  private async loginUser(email: string, password: string): Promise<void> {
    try {
      const res = await Request.loginUser({ email, password });
      AuthorizationForm.authorizationInfo.isAuthorized = true;
      Object.assign(AuthorizationForm.authorizationInfo, res);
      console.log(AuthorizationForm.authorizationInfo);
      this.setLocalStorage();
      console.log(res);
    } catch (error) {
      if (error == 'SyntaxError: Unexpected token F in JSON at position 0') {
        this.showErrorMessage('password-error', 'Wrong password');
        return;
      }
      const res = await Request.createUser({
        name: 'user',
        email,
        password,
      });
      console.log(res);
      if (res.error) {
        res.error.errors.forEach((err) => { 
          const id = err.message[1] === 'e' ? 'email-error' : 'password-error';
          this.showErrorMessage(id, err.message);
        })
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
