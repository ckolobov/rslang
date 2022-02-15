import Utils from '../../services/Utils';
import Drawer from '../drawer/Drawer';
import Page from '../pages/Page';
import Error404 from '../pages/Error404';
import Home from '../pages/Home';
import Textbook from '../pages/Textbook';
import Statistics from '../pages/Statistics';
import AudioChallenge from '../pages/AudioChallenge';
import Hangman from '../pages/Hangman';
import Pexeso from '../pages/Pexeso';
import Sprint from '../pages/Sprint';
import Header from '../Header';
import Footer from '../Footer';

export interface Request {
  resource: string;
  id: string;
  verb: string;
}

const routes: Record<string, new () => Page> = {
  '/': Home,
  '/textbook/:id/:verb': Textbook,
  '/statistics': Statistics,
  '/audio_challenge': AudioChallenge,
  '/hangman': Hangman,
  '/pexeso': Pexeso,
  '/game-sprint': Sprint,
};

class Router {
  private async router(): Promise<void> {
    // Get the parsed URl from the addressbar
    const request: Request = Utils.parseRequestURL();

    const parsedURL: string =
      (request.resource ? `/${request.resource}` : '/') +
      (request.id ? '/:id' : '') +
      (request.verb ? '/:verb' : '');

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    const page: new () => Page = routes[parsedURL] ? routes[parsedURL] : Error404;
    Drawer.drawPage(page);
  }

  private async renderHeaderAndFooter(): Promise<void> {
    const header = await Drawer.drawComponent(Header, {class: 'header'});
    (document.getElementById('header_container') as HTMLElement).innerHTML = header;
    const footer = await Drawer.drawComponent(Footer, {class: 'footer'});
    (document.getElementById('footer_container') as HTMLElement).innerHTML = footer;
  }

  public init(): void {
    // Listen on hash change:
    window.addEventListener('hashchange', this.router);

    // Listen on page load:
    window.addEventListener('load', this.renderHeaderAndFooter);
    window.addEventListener('load', this.router);
  }
}

export default Router;
