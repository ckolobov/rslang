type Word = {
  id:	string,
  _id?:	string,
  group: number,
  page:	number,
  word:	string,
  image: string,
  audio: string,
  audioMeaning:	string,
  audioExample:	string,
  textMeaning: string,
  textExample: string,
  transcription: string,
  wordTranslate: string,
  textMeaningTranslate:	string,
  textExampleTranslate:	string,
}

type UserWord = {
  difficulty:	string,
  optional:	object,
}

type Statistic = {
  learnedWords:	number,
  optional: object,
}

type Setting = {
  wordsPerDay: number,
  optional:	object,
}

type User = {
  name:	string,
  email: string,
  password: string,
}

type UserInfo = {
  id: string,
  token: string,
}

type Auth = {
  message: string,
  token: string,
  refreshToken:	string,
  userId:	string,
  name: string,
}