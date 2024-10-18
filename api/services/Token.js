import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Forbidden, Unauthorized } from "../utils/Errors.js";

dotenv.config();

class TokenService {
  static async generateAccessToken(payload) {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "30m",
    });
    
    return accessToken
  }

  static async generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });
  }

  static async checkAccess(req, _, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(" ")?.[1];
    
    if (!token) {
      return next(new Unauthorized());
    }

    try {
      req.user = await TokenService.verifyAccessToken(token);
      console.log('user:', req.user);
      
    } catch (error) {
      console.log('error checkAccess:', error);
      return next(new Unauthorized());
    }
  
    next();
  }

  static async verifyAccessToken(accessToken) {
    return jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  }
  static async verifyRefreshToken(refreshToken) {
    return jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
  }
}

export default TokenService;
