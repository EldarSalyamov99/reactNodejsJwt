import AuthService from "../services/Auth.js";
import ErrorsUtils from "../utils/Errors.js";
import { COOKIE_SETTINGS } from "../constants.js";

class AuthController {
  static async signIn(req, res) {
    const {userName, password} = req.body;
    const { fingerprint } = req;

    try {
      const { accessToken, refreshToken, accessTokenExpiration } = await AuthService.signIn({ userName, password, fingerprint });

      await res.cookie("refreshToken", refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
      return res.status(201).json({ accessToken, accessTokenExpiration });
    } catch (err) {
      return ErrorsUtils.catchError(res, err);
    }
  }

  static async signUp(req, res) {
    const {userName, password, role} = req.body;
    const { fingerprint } = req;

    try {
      const { accessToken, refreshToken, accessTokenExpiration } = await AuthService.signUp({ userName, password, fingerprint, role });

      await res.cookie("refreshToken", refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
      return res.status(201).json({ accessToken, accessTokenExpiration });
    } catch (err) {
      return ErrorsUtils.catchError(res, err);
    }
  }

  static async logOut(req, res) {

    const refreshToken = req.cookies.refreshToken;

    const { fingerprint } = req;
    try {
      await AuthService.logOut(refreshToken);
      res.clearCookie("refreshToken", { expires: new Date(0) });

      return res.status(200).json({ message: "Вы вышли из аккаунта" });
    } catch (err) {
      return ErrorsUtils.catchError(res, err);
    }
  }

  static async refresh(req, res) {
    const { fingerprint } = req;
    const currentRefreshToken = req.cookies.refreshToken;
    try {
      const { accessToken, refreshToken, accessTokenExpiration } = await AuthService.refresh({ currentRefreshToken, fingerprint });
      res.cookie("refreshToken", refreshToken, COOKIE_SETTINGS.REFRESH_TOKEN)
      return res.status(200).json({ accessToken, accessTokenExpiration });
    } catch (err) {
      return ErrorsUtils.catchError(res, err);
    }
  }
}

export default AuthController;