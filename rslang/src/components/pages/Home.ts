import Page from './Page';
import '../../scss/layout/_home.scss';

class Home implements Page {
  public async render(): Promise<string> {
    const page = localStorage.getItem('rslang_current_page') || 0;
    const group = localStorage.getItem('rslang_current_group') || 0;
    const view = `
  <section class="promo">
    <div class="wrapper promo__wrapper">
      <h2 class="promo__title">
        Learn 3600 m<span>ost</span> c<span>ommon</span> E<span
          >nglish</span
        >
        words
      </h2>
      <a href="/#/textbook/${group}/${page}" class="button promo__button">Start</a>
    </div>
  </section>
  <section class="team">
    <h3 class="team__title">Our team</h3>
    <div class="team-members">
      <div class="team-member__card">
        <a class="member__link" href="https://github.com/ckolobov"
          ><h4 class="team-member__name">Constantine</h4>
          <img
            src="https://avatars.githubusercontent.com/u/26676430?v=4"
            class="team-member__img"
        /></a>
        <p class="team-member__text">
          Тимлид, разработал архитектуру приложения, организовал обновление токенов, создал игру "Спринт".
        </p>
      </div>
      <div class="team-member__card">
        <a class="member__link" href="https://github.com/Andrei-Anaheim"
          ><h4 class="team-member__name">Andrei</h4>
          <img
            src="https://avatars.githubusercontent.com/u/86974515?v=4"
            class="team-member__img"
        /></a>
        <p class="team-member__text">
          Реализовал разделы "Учебник" и "Долгосрочная статистика", разработал карточки слов со статистикой, создал игры "Виселица" и "Пексесо".
        </p>
      </div>
      <div class="team-member__card">
        <a class="member__link" href="https://github.com/MilanaKard"
          ><h4 class="team-member__name">Milana</h4>
          <img
            src="https://avatars.githubusercontent.com/u/87133349?v=4"
            class="team-member__img"
        /></a>
        <p class="team-member__text">
          Разработала дизайн приложения, создала механизм авторизации, игру "Аудиовызов", главную страницу и раздел "Статистика за день".
        </p>
      </div>
    </div>
  </section>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default Home;
