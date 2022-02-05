import Utils from "../../services/Utils";
import Drawer from "../drawer/Drawer";
import Page from "../pages/Page";
import Error404 from "../pages/Error404";
import Home from "../pages/Home";
import Textbook from "../pages/Textbook";

export interface Request {
  resource: string,
  id: string,
  verb: string
}

const routes: Record<string, Page> = {
  '/': new Home,
  '/textbook': new Textbook
};
const errorPage: Error404 = new Error404;

class Router {
  private

  private async router(): Promise<void> {
    // Get the parsed URl from the addressbar
    const request: Request = Utils.parseRequestURL();

    const parsedURL: string = (request.resource ? `/${request.resource}` : '/')
    + (request.id ? '/:id' : '')
    + (request.verb ? '/:verb' : '');

    // Get the page from our hash of supported routes.
    // If the parsed URL is not in our list of supported routes, select the 404 page instead
    const page: Page = routes[parsedURL] ? routes[parsedURL] : errorPage;
    Drawer.drawPage(page);
  }

  public init(): void {
    // Listen on hash change:
    window.addEventListener('hashchange', this.router);

    // Listen on page load:
    window.addEventListener('load', this.router);
  }
}

export default Router;