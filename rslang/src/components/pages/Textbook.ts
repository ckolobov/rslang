import Page from './Page';
import Drawer from '../drawer/Drawer';
import WordCard from '../common/WordCard';
import Request, { Difficulty } from '../../services/Requests';
import '../../scss/layout/_textbook.scss';
import { Card } from '../common/WordCard';
import AuthorizationForm from '../common/AuthorizationForm';

class Textbook implements Page {
  private showActiveGroupButton(): void {
    const buttons = document.querySelectorAll('.textbook__button');
    const hash = window.location.hash.split('/');
    let groupX = 0;
    if (hash[2] === 'info') {
      groupX = 7;
    } else {
      groupX = Number(window.location.hash.split('/')[2]);
    }
    buttons.forEach((el) => el.classList.remove('button'));
    buttons.forEach((el) => el.classList.add('button_grey'));
    buttons[groupX].classList.remove('button_grey');
    buttons[groupX].classList.add('button');
  }

  public async render(): Promise<string> {
    const groupX =
      Number(window.location.hash.split('/')[2]) ||
      (Number(window.location.hash.split('/')[2]) === 0 ? 0 : 7);
    const pageX = Number(window.location.hash.split('/')[3]);
    let idX: string, tokenX: string;
    try {
      tokenX = (localStorage.getItem('userInfo') as string).split('"token":"')[1].toString().split('",')[0];
      idX = (localStorage.getItem('userInfo') as string).split('"userId":"')[1].toString().split('",')[0];
    } catch {
      tokenX = '';
      idX = '';
    }
    const pageMinus = pageX > 0 ? pageX - 1 : pageX;
    const pagePlus = pageX < 29 ? pageX + 1 : pageX;
    const res: Card[] = groupX === 6 && AuthorizationForm.isAuthorized? await Request.getAggregatedWordsList({id: idX, token: tokenX, filter: '{"userWord.difficulty":"2"}'}): await Request.getWordsList({group: groupX, page: pageX});
    const arrayLength: number = groupX === 6 && AuthorizationForm.isAuthorized? res[0].paginatedResults.length: res.length;
    let result = '';
    let total_diff = 0;
    for (let i = 0; i < arrayLength; i += 1) {
      if (groupX===6 && AuthorizationForm.isAuthorized) {
        res[0].paginatedResults[i]['diff'] = 1; //надо 2, но чтобы не фонило красным сделал 1
        result += await Drawer.drawComponent(WordCard, res[0].paginatedResults[i]);
      } else {
        if(AuthorizationForm.isAuthorized) {
          let wordDiff: number;
          try {
            const ans = await Request.getWordFromUserWordsList(idX, tokenX, res[i].id);
            wordDiff = Number(ans.difficulty);
            total_diff += wordDiff;
          } catch {
            wordDiff = 1;
            await Request.SetWordInUsersList(idX, tokenX, res[i].id, Difficulty.NORMAL, 0);
            total_diff += wordDiff;
          }
          res[i].diff = wordDiff;
        }
        result += await Drawer.drawComponent(WordCard, res[i]);
      }
    }
    setTimeout(()=>{localStorage.setItem("rslang-current-page-total-difficulty", `${total_diff}`),100});
    const logStatus = (document.getElementById('authorization-button') as HTMLElement).innerHTML;
    result = result
      ? result
      : logStatus === 'Log in'
      ? '<span>Вы еще не авторизованы</span>'
      : '<span>Вы еще не выбрали ни одного слова</span>';
    const info = `
    <section class="level-info" style="background:red; color:black">
      <a href="/#/textbook/0/0" class="level-info-link">
        <div class="level">A1</div>
        <div class="level-name">Elementary</div>
        <div class="level-description">
          <p>Элементарный уровень</p>
          <p>Даже начальный уровень английского, усиленный достаточным словарным запасом, 
          позволит вам чувствовать себя уверенно в любой ситуации, которая может возникнуть в другой стране.</p>
          <p>Подобранные в этом разделе частицы речи полезны тем, что вы можете сразу же начинать их использовать. 
          Это наиболее легкие и часто применимые English words.</p>
        </div>
      </a>
    </section>
    <section class="level-info" style="background:orange; color:black">
      <a href="/#/textbook/1/0" class="level-info-link">
        <div class="level">A2</div>
        <div class="level-name">Pre-Intermediate</div>
        <div class="level-description">
          <p>Предпороговый уровень</p>
          <p>Лексика уровня А2 предполагает сформированный ранее запас слов, который можно и нужно комбинировать с новыми словами и выражениями.</p>
          <p>Освоив уровень А2, вы сможете поддержать беседу на простейшие бытовые темы, рассказать о себе и своих увлечениях, обсудить художественные произведения на поверхностном уровне</p>
        </div>
      </a>
    </section>
    <section class="level-info" style="background:pink; color:black">
      <a href="/#/textbook/2/0" class="level-info-link">
        <div class="level">B1</div>
        <div class="level-name">Intermediate</div>
        <div class="level-description">
          <p>Cредний уровень</p>
          <p>Словарный запас на среднем уровне дает еще больше возможностей для общения, работы и досуга. Как правило, с этого момента начинается не столько обучение, сколько совершенствование того, что уже было вами освоено.</p>
          <p>На данном этапе Вы сможете вести спонтанную беседу без предварительной подготовки в спокойном ритме. Ваши знания позволят Вам объясняться, 
          умело подбирая синонимы в случае незнания конкретных терминов</p>
        </div>
      </a>
    </section>
    <section class="level-info" style="background:green; color:black">
      <a href="/#/textbook/3/0" class="level-info-link">
        <div class="level">B2</div>
        <div class="level-name">Upper-Intermediate</div>
        <div class="level-description">
          <p>Уровень выше среднего</p>
          <p>Словарный запас на данном уровне позволяет поддержать беседу на любую из неузкоспециализированных тем, влиться в разговор, понять монолог/диалог носителя, а также выразить свою позицию, оперируя сложными грамматическими приёмами.</p>
          <p>В результате вы умеете составлять связный, понятный, грамотный монолог до 10 минут и выдержать атаку вопросами после.</p>
        </div>
      </a>
    </section>
    <section class="level-info" style="background:lightblue; color:black">
      <a href="/#/textbook/4/0" class="level-info-link">
        <div class="level">C1</div>
        <div class="level-name">Advanced</div>
        <div class="level-description">
          <p>Продвинутый уровень</p>
          <p>Слова уровня C1 — это те маркеры, которые отличают уверенного пользователя языка от людей, использующих английский не на регулярной основе.</p>
          <p>С тем лексическим запасом, который вы накопите после прохождения этого этапа, вы можете думать на английском не хуже, чем на родном языке. На этом уровне даже полный changeover всех ваших рабочих и личных материалов into English не станет для вас потрясением и проблемой.</p>
        </div>
      </a>
    </section>
    <section class="level-info" style="background:blueviolet; color:black">
      <a href="/#/textbook/5/0" class="level-info-link">
        <div class="level">C2</div>
        <div class="level-name">Proficient</div>
        <div class="level-description">
          <p>Профессиональный уровень</p>
          <p>Название уровня говорит само за себя - изучив данный уровень, Вы воистину можете считать себя настоящим профессионалом в вопросах английской словестности.</p>
          <p>Теперь Вам подвластно абсолютно все, разговор на любую, даже самую специфическую тему щелкается Вами как орешки. 
          С таким огромным словарным запасом теперь все зависит лишь от того, как часто вы сможете практиковаться во владении английским языком.</p>
        </div>
      </a>
    </section>
    `;
    const view = `
    <div class="textbook-navigation">
      <div class="wrapper textbook-navigation__wrapper">
        <div class="navigation-buttons">
          <a href="/#/textbook/0/0" class="${groupX === 0 ? 'button' : 'button_grey'} textbook__button">A1</a>
          <a href="/#/textbook/1/0" class="${groupX === 1 ? 'button' : 'button_grey'} textbook__button">A2</a>
          <a href="/#/textbook/2/0" class="${groupX === 2 ? 'button' : 'button_grey'} textbook__button">B1</a>
          <a href="/#/textbook/3/0" class="${groupX === 3 ? 'button' : 'button_grey'} textbook__button">B2</a>
          <a href="/#/textbook/4/0" class="${groupX === 4 ? 'button' : 'button_grey'} textbook__button">C1</a>
          <a href="/#/textbook/5/0" class="${groupX === 5 ? 'button' : 'button_grey'} textbook__button">C2</a>
          <a href="/#/textbook/6/0" class="${groupX === 6 ? 'button' : 'button_grey'} textbook__button">User words</a>
          <a href="/#/textbook/info/0" class="${groupX === 7 ? 'button' : 'button_grey'} textbook__button">info</a>
        </div>
      </div>
    </div>
    <section class="word-cards">
      ${groupX === 7 ? info : result}
    </section>
    <section>
      <div class="wrapper page-changer__wrapper" style="${groupX === 6 || groupX === 7 ? 'display:none' : ''}">
        <a href="/#/audio_challenge" class="${logStatus === 'Log out' ? 'button' : 'button_grey'} game__button" style="pointer-events:${logStatus === 'Log out' ? '' : 'none'}">Audio challenge</a>
        <div class="page-buttons" id="page-buttons">
          <a href="/#/textbook/${groupX}/0" class="page-changer" id="page-start"><<</a>
          <a href="/#/textbook/${groupX}/${pageMinus}" class="page-changer" id="page-minus"><</a>
          <div class="current-page" id="current-page"><span id="current-page-span">${pageX + 1}/30</span></div>
          <a href="/#/textbook/${groupX}/${pagePlus}" class="page-changer" id="page-plus">></a>
          <a href="/#/textbook/${groupX}/29" class="page-changer" id="page-end">>></a>
        </div>
        <a href="/#/sprint" class="${logStatus === 'Log out' ? 'button' : 'button_grey'} game__button" style="pointer-events:${logStatus === 'Log out' ? '' : 'none'}">Sprint</a>
      </div>
    </section>
      `;
    return view;
  }

  private updateGroupPage(): void {
    const hash = window.location.hash.split('/');
    if (hash[1] === 'textbook' && hash.length === 4) {
      const groupX = Number(window.location.hash.split('/')[2]);
      const pageX = Number(window.location.hash.split('/')[3]);
      localStorage.setItem('rslang_current_page', `${pageX}`);
      localStorage.setItem('rslang_current_group', `${groupX}`);
      (document.getElementById('textbook') as HTMLLinkElement).setAttribute(
        'href',
        `/#/textbook/${groupX}/${pageX}`
      );
    }
  }

  private updatePageButtons(): void {
    const hash = window.location.hash.split('/');
    if (hash[1] === 'textbook' && hash.length === 4) {
      const groupX = Number(window.location.hash.split('/')[2]);
      const pageX = Number(window.location.hash.split('/')[3]);
      (document.getElementById('page-start') as HTMLLinkElement).setAttribute(
        'href',
        `/#/textbook/${groupX}/0`
      );
      (document.getElementById('page-end') as HTMLLinkElement).setAttribute(
        'href',
        `/#/textbook/${groupX}/29`
      );
      if (pageX > 0)
        (document.getElementById('page-minus') as HTMLLinkElement).setAttribute(
          'href',
          `/#/textbook/${groupX}/${pageX - 1}`
        );
      if (pageX < 29)
        (document.getElementById('page-plus') as HTMLLinkElement).setAttribute(
          'href',
          `/#/textbook/${groupX}/${pageX + 1}`
        );
    }
  }

  public playAudio(this: Element): void {
    const audio_word = this.children[0] as HTMLAudioElement;
    const audio_meaning = this.children[1] as HTMLAudioElement;
    const audio_example = this.children[2] as HTMLAudioElement;
    audio_word.play();
    audio_word.onended = () => {
      audio_meaning.play();
    };
    audio_meaning.onended = () => {
      audio_example.play();
    };
  }

  public async after_render(): Promise<void> {
    window.addEventListener('hashchange', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (window.location.hash.split('/')[1] === 'textbook') {
        setTimeout(this.updateGroupPage, 100);
        setTimeout(this.updatePageButtons, 100);
        setTimeout(this.showActiveGroupButton, 100);
      }
    });
    document.querySelectorAll('.word-card__audio').forEach((el) => el.addEventListener('click', this.playAudio));
    setTimeout(()=>{
      if(Number(localStorage.getItem('rslang-current-page-total-difficulty')) === 0) {
        (document.querySelectorAll('.game__button') as NodeListOf<HTMLElement>).forEach((el)=>el.setAttribute('style', 'pointer-events:none'));
      }
    }, 200);
    return;
  }
}

export default Textbook;
