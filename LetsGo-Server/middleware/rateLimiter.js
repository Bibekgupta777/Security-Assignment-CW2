const rateLimit = require("express-rate-limit");


const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, 
  message: "Too many requests from this IP, please try again later.",
});


const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: "Too many login attempts, please try again after 15 minutes.",
});


const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 10,
  message: "Too many signup attempts from this IP, please try again after an hour.",
});


const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many requests from this IP (admin area), please slow down.",
});


const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many payment requests, please try later.",
});


const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: "Too many contact form submissions, please wait.",
});


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
