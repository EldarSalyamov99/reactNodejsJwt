import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import TokenService from "./Token.js";
import { NotFound, Forbidden, Conflict, Unauthorized } from "../utils/Errors.js";
import RefreshSessionsRepository from "../repositories/RefreshSession.js";
import UserRepository from "../repositories/User.js";
import { ACCESS_TOKEN_EXPIRATION } from "../constants.js";

class AuthService {
  static async signIn({ userName, password, fingerprint }) {
    const userData = await UserRepository.getUserData(userName);

    if (!userData) throw new NotFound("Пользователь с таким именем не существует");

    const isValidPassword = await bcrypt.compare(password, userData.password);

    if (!isValidPassword) throw new Unauthorized("Неверный пароль");

    const payload = { id: userData.id, role: userData.role, userName };
    const accessToken = await TokenService.generateAccessToken(payload);
    const refreshToken = await TokenService.generateRefreshToken(payload);

    await RefreshSessionsRepository.createRefreshSession({
      id: userData.id,
      refreshToken,
      fingerprint,
    });

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    }
  }

  static async signUp({ userName, password, fingerprint, role }) {
    const userData = await UserRepository.getUserData(userName);
    if (userData) throw new Conflict("Пользователь с таким именем уже существует")

    const { id } = await UserRepository.createUser({userName, password, role})
    const payload = { id, userName, role }
    const accessToken = await TokenService.generateAccessToken(payload)
    const refreshToken = await TokenService.generateRefreshToken(payload)

    await RefreshSessionsRepository.createRefreshSession({id, refreshToken, fingerprint})

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    }
  }

  static async logOut(refreshToken) {
    await RefreshSessionsRepository.deleteRefreshSession(refreshToken)
  }

  static async refresh({ fingerprint, currentRefreshToken }) {
    if (!currentRefreshToken) throw new Unauthorized();

    const refreshSession = await RefreshSessionsRepository.getRefreshSession(currentRefreshToken);
    if (!refreshSession) throw new Unauthorized();
    if (refreshSession.finger_print !== fingerprint.hash) throw new Forbidden();

    await RefreshSessionsRepository.deleteRefreshSession(currentRefreshToken);

    let payload;
    try {
      payload = await TokenService.verifyRefreshToken(currentRefreshToken);
    } catch (error) {
      throw new Forbidden(error);
    }

    const {id, role, name: userName} = await UserRepository.getUserData(payload.userName);
    const accessToken = await TokenService.generateAccessToken({id, role, userName});
    const refreshToken = await TokenService.generateRefreshToken({id, role, userName});

    await RefreshSessionsRepository.createRefreshSession({id, refreshToken, fingerprint});

    return {
      accessToken,
      refreshToken,
      accessTokenExpiration: ACCESS_TOKEN_EXPIRATION,
    }
  }
}

export default AuthService;
