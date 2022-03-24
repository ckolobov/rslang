import Component from './common/Component';
import '../scss/layout/_footer.scss';

class Footer implements Component {
  public async render(): Promise<string> {
    const view = `
    <div class="wrapper footer footer__wrapper">
      <a class="link rs-logo" href="https://rs.school/">
        <div class="rs-logo__img"></div>
      </a>
      <div class="footer__content">
        <ul class="contacts">
          <li>
            <a class="link contacts__link" href="https://github.com/ckolobov"
              >ckolobov</a>
          </li>
          <li>
            <a class="link contacts__link"
              href="https://github.com/Andrei-Anaheim"
              >Andrei-Anaheim</a>
          </li>
          <li>
            <a class="link contacts__link"
              href="https://github.com/MilanaKard"
              >MilanaKard</a>
          </li>
        </ul>
        <div>2022</div>
      </div>
    </div>
    `;
    return view;
  }

  public async after_render(): Promise<void> {
    return;
  }
}

export default Footer;