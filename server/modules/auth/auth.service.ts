import bcrypt from "bcryptjs";
import { User, type IUser } from "./auth.model";
import { AppError, UnauthorizedError, ConflictError, generateAccessToken, generateRefreshToken, type JwtPayload } from "../../core";

export class AuthService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async registerUser(userData: any): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const { email, mobile, password, name } = userData;

    // Check if user already exists
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new ConflictError("البريد الإلكتروني مسجل مسبقاً");
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) throw new ConflictError("رقم الجوال مسجل مسبقاً");
    }

    const hashedPassword = password ? await this.hashPassword(password) : undefined;

    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      mobile: user.mobile,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { user, accessToken, refreshToken };
  }

  async loginUser(credentials: { email?: string; mobile?: string; password?: string }): Promise<{ user: IUser; accessToken: string; refreshToken: string }> {
    const { email, mobile, password } = credentials;

    const query: any = {};
    if (email) query.email = email;
    else if (mobile) query.mobile = mobile;
    else throw new AppError("يجب تقديم البريد الإلكتروني أو رقم الجوال", 400);

    const user = await User.findOne(query);
    if (!user) throw new UnauthorizedError("بيانات الدخول غير صحيحة");

    if (password) {
      if (!user.password) throw new UnauthorizedError("يرجى تعيين كلمة مرور لهذا الحساب أولاً");
      const isMatch = await this.comparePassword(password, user.password);
      if (!isMatch) throw new UnauthorizedError("بيانات الدخول غير صحيحة");
    }

    const payload: JwtPayload = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
      mobile: user.mobile,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return { user, accessToken, refreshToken };
  }

  async getMe(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) throw new UnauthorizedError("المستخدم غير موجود");
    return user;
  }

  async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const { verifyRefreshToken } = await import("../../core");
      const payload = verifyRefreshToken(token);
      
      const user = await User.findById(payload.userId);
      if (!user) throw new UnauthorizedError("المستخدم غير موجود");

      const newPayload: JwtPayload = {
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
        mobile: user.mobile,
      };

      const accessToken = generateAccessToken(newPayload);
      const newRefreshToken = generateRefreshToken(newPayload);

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedError("رمز التحديث غير صالح");
    }
  }
}

export const authService = new AuthService();
