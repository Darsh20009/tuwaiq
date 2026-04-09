export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "المورد") {
    super(`${resource} غير موجود`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string = "بيانات غير صحيحة") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "غير مصرح لك بالدخول") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "ليس لديك صلاحية") {
    super(message, 403);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = "البيانات موجودة مسبقاً") {
    super(message, 409);
  }
}

export function handleError(err: any, res: any): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message, success: false });
    return;
  }

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e: any) => e.message).join(", ");
    res.status(400).json({ message: messages, success: false });
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || "field";
    res.status(409).json({ message: `${field} موجود مسبقاً`, success: false });
    return;
  }

  console.error("[Error]", err);
  res.status(500).json({ message: "خطأ داخلي في الخادم", success: false });
}
