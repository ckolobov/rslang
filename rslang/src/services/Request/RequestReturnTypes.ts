import { createUserErrorCodes, loginUserErrorCodes } from "./RequestErrorCodes";

export type createUserReturn = {
  data?: {
    name: "string",
    email: "string",
    password: "string",
  }
  error?: {
    code: createUserErrorCodes,
    message: string,
    errors?: {message: string, path: string[]}[],
  }
}

export type loginUserReturn = {
  data?: Auth,
  error?: {
    code: loginUserErrorCodes,
    message: string,
  }
}