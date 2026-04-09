import { Request, Response } from "express";
import { authService } from "./auth.service";
import { handleError } from "../../core";

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { user, accessToken, refreshToken } = await authService.registerUser(req.body);
      
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 mins
        sameSite: "strict"
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict"
      });

      res.status(201).json({
        success: true,
        message: "تم التسجيل بنجاح",
        data: { user, accessToken }
      });
    } catch (err) {
      handleError(err, res);
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { user, accessToken, refreshToken } = await authService.loginUser(req.body);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000, // 15 mins
        sameSite: "strict"
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        sameSite: "strict"
      });

      res.status(200).json({
        success: true,
        message: "تم تسجيل الدخول بنجاح",
        data: { user, accessToken }
      });
    } catch (err) {
      handleError(err, res);
    }
  }

  async logout(req: Request, res: Response) {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    
    // Also clear passport session if any
    if (req.logout) {
      req.logout(() => {});
    }

    res.status(200).json({
      success: true,
      message: "تم تسجيل الخروج بنجاح"
    });
  }

  async me(req: Request, res: Response) {
    try {
      const currentUser = (req as any).currentUser;
      if (!currentUser) {
        return res.status(401).json({ success: false, message: "غير مصرح لك" });
      }

      const user = await authService.getMe(currentUser.userId);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      handleError(err, res);
    }
  }

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.refreshToken || req.body.refreshToken;
      if (!token) {
        return res.status(401).json({ success: false, message: "رمز التحديث مطلوب" });
      }

      const { accessToken, refreshToken: newRefreshToken } = await authService.refreshToken(token);

      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 15 * 60 * 1000,
        sameSite: "strict"
      });

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "strict"
      });

      res.status(200).json({
        success: true,
        data: { accessToken }
      });
    } catch (err) {
      handleError(err, res);
    }
  }
}

export const authController = new AuthController();
