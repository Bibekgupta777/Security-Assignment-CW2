const rateLimit = require("express-rate-limit");

// General rate limiter for all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});

// Login limiter for sign-in route
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: "Too many login attempts, please try again after 15 minutes.",
});

// Signup limiter for sign-up route
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: "Too many signup attempts from this IP, please try again after an hour.",
});

// Admin routes limiter
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP (admin area), please slow down.",
});

// Payment limiter
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many payment requests, please try later.",
});

// Contact form limiter
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many contact form submissions, please wait.",
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: "Too many password reset requests, please try later.",
});

module.exports = {
  generalLimiter,
  loginLimiter,
  authLimiter,
  adminLimiter,
  paymentLimiter,
  contactLimiter,
  passwordResetLimiter,
};
