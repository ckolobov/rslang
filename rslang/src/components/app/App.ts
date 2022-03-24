import './App.scss'
import Router from '../router/Router';
import Authorization from '../../services/Authorization';

class App {
  public async start(): Promise<void> {
    const authorization = Authorization.getInstance();
    await authorization.updateToken();
    const router = new Router();
    router.init();
  }
}

export default App;