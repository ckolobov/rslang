import { Request } from '../components/router/Router';
const url = 'http://localhost:3001';

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

  getFullURL: (hash) => {
    return url + hash;
  },
};

export default Utils;
