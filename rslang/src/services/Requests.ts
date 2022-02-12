import Utils from './Utils';

const url = Utils.getFullURL('');

export enum Difficulty {
  CASUAL,
  NORMAL1,
  NORMAL2,
  HARD,
}
export class Request {
  // 1. Получить слова определенной группы, определенной страницы
  static async getWordsList(options: { group?: number; page?: number }) {
    const rawResponse = await fetch(
      `${url}/words?group=${options.group || 0}&page=${options.page || 0}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );
    const content = await rawResponse.json();
    return content;
  }

  // 2. Получить конкретное слово по id
  static async getWordById(id: string) {
    const rawResponse = await fetch(`${url}/words/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    const content = await rawResponse.json();
    return content;
  }

  //3. Создаем пользователя
  static async createUser(user: {
    name: string;
    email: string;
    password: string;
  }) {
    const rawResponse = await fetch(`${url}/users`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    const content = await rawResponse.json();
    return content;
  }

  // 4. Получить информацию о пользователе
  static async getUserInfo(id: string, token: string) {
    const rawResponse = await fetch(`${url}/users/${id}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const content = await rawResponse.json();
    return content;
  }

  //5. Изменить информацию о пользователе
  static async editUserInfo(
    id: string,
    token: string,
    email: string,
    password: string
  ) {
    const rawResponse = await fetch(`${url}/users/${id}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `${email}`,
        password: `${password}`,
      }),
    });
    const content = await rawResponse.json();
    return content;
  }

  //6. Удаление пользователя
  static async deleteUser(id: string, token: string) {
    await fetch(`${url}/users/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    });
  }

  //7. Получение нового токена
  static async getNewToken(id: string, refreshtoken: string) {
    const rawResponse = await fetch(`${url}/users/${id}/tokens`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${refreshtoken}`,
      },
    });
    const content = await rawResponse.json();
    return content;
  }

  //8. Получение списка сложных слов конкретного пользователя
  static async getUserWordsList(id: string, token: string) {
    const rawResponse = await fetch(`${url}/users/${id}/words`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const content = await rawResponse.json();
    return content;
  }

  //9. Добавить слово в словарь сложных слов конкретного пользователя.
  static async SetWordInUsersList(
    id: string,
    token: string,
    wordid: string,
    difficulty: Difficulty
  ) {
    const rawResponse = await fetch(`${url}/users/${id}/words/${wordid}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: `${difficulty}`,
      }),
    });
    const content = await rawResponse.json();
    return content;
  }

  //10. Получить слово из словаря сложных слов по айди
  static async getWordFromUserWordsList(
    id: string,
    token: string,
    wordid: string
  ) {
    const rawResponse = await fetch(`${url}/users/${id}/words/${wordid}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const content = await rawResponse.json();
    return content;
  }

  //11. Отредактировать слово в списке сложных слов
  static async editWordInUserWordsList(
    id: string,
    token: string,
    wordid: string,
    difficulty: Difficulty
  ) {
    const rawResponse = await fetch(`${url}/users/${id}/words/${wordid}`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        difficulty: `${difficulty}`,
      }),
    });
    const content = await rawResponse.json();
    return content;
  }

  //12. Удалить слово из списка сложных слов конкретного пользователя
  static async deleteWordFromUsersList(
    id: string,
    token: string,
    wordid: string
  ) {
    await fetch(`${url}/users/${id}/words/${wordid}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'DELETE',
    });
  }

  //13. Получить слова определенной группы, определенной страницы c возможностью фильтрации
  static async getAggregatedWordsList(options: {
    id: string;
    token: string;
    group?: number;
    page?: number;
    wordsPerPage?: number;
    filter?: string;
  }) {
    const filterGroup = options.group ? `&group=${options.group}` : '';
    const filterPage = options.page ? `&page=${options.page}` : '';
    const filterWordsPerPage = options.wordsPerPage
      ? `&wordsPerPage=${options.wordsPerPage}`
      : '';
    const filterFilter = options.filter ? `&filter=${options.filter}` : '';
    const sumFilter =
      filterGroup + filterPage + filterWordsPerPage + filterFilter;
    const finalFilter = sumFilter ? `?${sumFilter.slice(1)}` : '';
    const rawResponse = await fetch(
      `${url}/users/${options.id}/aggregatedWords${finalFilter}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${options.token}`,
        },
      }
    );
    const content = await rawResponse.json();
    return content;
  }

  //14. Получить слово по id. Не ясно чем по сути отличается от getWordById.
  static async getAggregatedWord(id: string, token: string, wordid: string) {
    const rawResponse = await fetch(
      `${url}/users/${id}/aggregatedWords/${wordid}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const content = await rawResponse.json();
    return content;
  }

  //15. Обновить данные в статистике.
  static async editStatistics(
    id: string,
    token: string,
    learnedWords: number,
    playedGames: number,
    successRate: string
  ) {
    const rawResponse = await fetch(`${url}/users/${id}/statistics`, {
      method: 'PUT',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        learnedWords: `${learnedWords}`,
        optional: {
          playedGames: `${playedGames}`,
          successRate: `${successRate}`,
        },
      }),
    });
    const content = await rawResponse.json();
    return content;
  }

  //16. Получить статистику по игроку
  static async getStatistics(id: string, token: string) {
    const rawResponse = await fetch(`${url}/users/${id}/statistics`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const content = await rawResponse.json();
    return content;
  }

  //17. Log in
  static async loginUser(user: { email: string; password: string }) {
    const rawResponse = await fetch(`${url}/signin`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    const content = await rawResponse.json();
    return content;
  }
}
export default Request;
