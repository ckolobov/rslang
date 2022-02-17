import Request from "./Request/Requests";
import { loginUserErrorCodes } from "./Request/RequestErrorCodes";

const LOCAL_STORAGE_USER_INFO = 'userInfo';

class Authorization {
  static instance: Authorization;

  private authorized = false;
  private userInfo: UserInfo | null = null;

  public async updateToken(): Promise<void> {
    const userInfo: string | null = localStorage.getItem(LOCAL_STORAGE_USER_INFO);
    if (!userInfo) return;

    const authorizationInfo: Auth = JSON.parse(userInfo);
    try {
      const userInfoUpdated = await Request.getNewToken(
        authorizationInfo.userId,
        authorizationInfo.refreshToken
      );
      authorizationInfo.token = userInfoUpdated.token;
      authorizationInfo.refreshToken = userInfoUpdated.refreshToken;
      this.updateUserInfo(authorizationInfo);
    } catch (e) {
      console.warn('User token update failed');
      this.logoutUser();
    }
  }

  public async loginUser(email: string, password: string): Promise<{
    error?: {
      code: loginUserErrorCodes
      message: string}
  }> {
    const res = await Request.loginUser({
      email,
      password,
    })
    if (res.data) {
      this.updateUserInfo(res.data);
    }
    return res;
  }

  public logoutUser(): void {
    localStorage.clear();
    window.location.reload();
  }

  private updateUserInfo(userData: Auth): void {
    this.userInfo = {
      id: userData.userId,
      token: userData.token,
    }
    this.authorized = true;
    localStorage.setItem(LOCAL_STORAGE_USER_INFO, JSON.stringify(userData));
  }

  public isAuthorized(): boolean {
    return this.authorized;
  }

  public getUserInfo(): UserInfo {
    if (!this.userInfo) {
      throw new Error('No user info found! Most probably user is not authorized');
    }
    return this.userInfo;
  }

  public static getInstance(): Authorization {
    if (!Authorization.instance) {
      Authorization.instance = new Authorization();
    }
    return Authorization.instance;
  }
}

export default Authorization;