import { Request } from '../components/router/Router';
import settings from '../components/app/settings';
const url = settings.BACKEND_DOMAIN;

const Utils = {
  // --------------------------------
  //  Parse a url and break it into resource, id and verb
  // --------------------------------
  parseRequestURL: () => {
    const url = window.location.hash.slice(1).toLowerCase() || '/';
    const r = url.split('/');
    const request: Request = {
      resource: r[1],
      id: r[2],
      verb: r[3],
    };

    return request;
  },

  randomizeArray: <T>(arr: T[]): T[] => {
    const result = [...arr];
    let currentIndex = result.length;
    let randomIndex: number;

    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      [result[currentIndex], result[randomIndex]] = [
        result[randomIndex],
        result[currentIndex],
      ];
    }

    return result;
  },

  getFullURL: (hash:string) => {
    return url + hash;
  },
};

export default Utils;
