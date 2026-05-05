import rateLimit from "express-rate-limit";

// ─── PCI DSS Requirement 6.4: Brute-force & DDoS protection ──────────────────

/** General API rate limit — 120 requests per 15 min per IP */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later.", code: "RATE_LIMIT" },
  skip: (req) => {
    // Never skip in production
    if (process.env.NODE_ENV === "production") return false;
    // In dev, allow health-checks to bypass
    return req.path === "/api/health";
  },
});

/** Auth endpoints — strict: 10 attempts per 15 min per IP (PCI DSS 8.3.4) */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Account temporarily locked.", code: "AUTH_RATE_LIMIT" },
  skipSuccessfulRequests: false,
});

/** Donation initiation — 20 per 15 min per IP (payment fraud prevention) */
export const donationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many payment requests. Please wait before trying again.", code: "PAYMENT_RATE_LIMIT" },
});

/** File uploads — 10 per hour per IP */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Upload limit reached. Please try again later.", code: "UPLOAD_RATE_LIMIT" },
});

/** Password reset / OTP — 5 per hour per IP */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many password reset requests.", code: "RESET_RATE_LIMIT" },
});
