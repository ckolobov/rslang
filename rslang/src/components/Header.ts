import Component from './common/Component';
import Drawer from './drawer/Drawer';
import Button from './common/Button';
import Authorization from '../services/Authorization';
import AuthorizationForm from './common/AuthorizationForm';
import '../scss/layout/_header.scss';

class Header implements Component {
  private authrization: Authorization;

  public constructor() {
    this.authrization = Authorization.getInstance();
  }

  public async render(): Promise<string> {
    const authorizationForm = await Drawer.drawComponent(AuthorizationForm, {
      class: 'login',
      id: 'authorization-form',
    });

    const authorizationButton = await Drawer.drawComponent(Button, {
      id: 'authorization-button',
      class: 'header__button',
      text: `${this.authrization.isAuthorized() ? 'Log out' : 'Log in'}`,
    });

    const page = localStorage.getItem('rslang_current_page') || 0;
    const group = localStorage.getItem('rslang_current_group') || 0;

    const view = `
    <div class="wrapper header header__wrapper">
      <a href="/#" class="logo link">
        <div class="logo__img"></div>
        <h1 class="logo__title">RS <span>Lang</span></h1>
      </a>
      <nav class="header__navigation">
        <ul class="navigation">
          <li>
            <a href="/#/textbook/${group}/${page}" class="link navigation__link" id="textbook">Textbook</a>
          </li>
          <li>
            <a href="/#/audio_challenge" class="link navigation__link" id="audio_challenge"
              >Audio challenge</a
            >
          </li>
          <li><a href="/#/game-sprint" class="link navigation__link" id="sprint">Sprint</a></li>
          <li>
            <a href="/#/statistics" class="link navigation__link" id="statistics">Statistics</a>
          </li>
        </ul>
      </nav>
      ${authorizationButton}
    </div>
    ${authorizationForm}
    `;
    return view;
  }

  private showActiveMenuItem(): void {
    const id: string = window.location.hash.slice(2).toLowerCase();
    const menuItems = document.querySelectorAll('.navigation__link') as NodeListOf<HTMLAnchorElement>;
    menuItems.forEach((item) => item.classList.remove('active'));
    const menuItem = document.getElementById(id) as HTMLElement;
    if (menuItem) {
      menuItem.classList.add('active');
    }
  }

  public async after_render(): Promise<void> {
    this.showActiveMenuItem();
    window.addEventListener('hashchange', this.showActiveMenuItem);

    const button = document.getElementById('authorization-button') as HTMLElement;
    const form = document.getElementById('authorization-form') as HTMLElement;

    button.addEventListener('click', () => {
      if (this.authrization.isAuthorized()) {
        this.authrization.logoutUser();
      } else {
        form.classList.add('active');
      }
    });
  }
}

export default Header;
