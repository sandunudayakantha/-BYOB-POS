const rateLimit = require('express-rate-limit');

// 1. Auth & Login Limiter (Max 10 attempts per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
  }
});

// 2. Public QR Menu Limiter (Max 100 requests per 1 minute)
const publicMenuLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many menu requests from this device. Please wait a moment before refreshing.'
  }
});

// 3. Global API Limiter (Max 300 requests per 15 minutes)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Global API rate limit reached from this IP. Please slow down.'
  }
});

module.exports = {
  authLimiter,
  publicMenuLimiter,
  globalLimiter
};
