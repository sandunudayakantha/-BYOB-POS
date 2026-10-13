const asyncHandler = require('../utils/asyncHandler');
const sendResponse = require('../utils/responseHandler');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../utils/jwt');

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes

// @desc    Login user (Super Admin / Restaurant Owner)
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password.' });
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials.' });
  }

  // Check if account is currently locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(423).json({
      success: false,
      message: `Account temporarily locked due to too many failed login attempts. Try again in ${minutesLeft} minute(s).`
    });
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    // Increment failed attempts
    user.loginAttempts = (user.loginAttempts || 0) + 1;

    if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
      user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      await user.save();
      return res.status(423).json({
        success: false,
        message: `Account locked for 15 minutes after ${MAX_LOGIN_ATTEMPTS} failed login attempts.`
      });
    }

    await user.save();
    return res.status(401).json({
      success: false,
      message: `Invalid credentials. ${MAX_LOGIN_ATTEMPTS - user.loginAttempts} attempt(s) remaining before lockout.`
    });
  }

  // Successful login — reset lockout fields
  user.loginAttempts = 0;
  user.lockUntil = null;

  if (user.status === 'SUSPENDED') {
    return res.status(403).json({ success: false, message: 'Your account has been suspended.' });
  }

  let restaurant = null;
  if (user.role === 'RESTAURANT_OWNER' && user.restaurantId) {
    restaurant = await Restaurant.findById(user.restaurantId);
    if (restaurant && restaurant.status === 'SUSPENDED') {
      return res.status(403).json({ success: false, message: 'Your restaurant account has been suspended.' });
    }
  }

  const accessToken = generateAccessToken(user._id, user.role, user.restaurantId);
  const refreshToken = generateRefreshToken(user._id);

  // Save refresh token
  user.refreshTokens.push({ token: refreshToken });
  await user.save();

  const userResponse = {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurant: restaurant ? {
      _id: restaurant._id,
      name: restaurant.name,
      logo: restaurant.logo,
      maxBranches: restaurant.maxBranches
    } : null
  };

  // Set refreshToken as httpOnly cookie (not accessible via JavaScript)
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return sendResponse(res, 200, 'Login successful', {
    user: userResponse,
    accessToken
  });
});

// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshToken = asyncHandler(async (req, res) => {
  // Read refreshToken from httpOnly cookie
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ success: false, message: 'Refresh token is required.' });
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
  }

  const user = await User.findById(decoded.userId);

  if (!user) {
    return res.status(401).json({ success: false, message: 'User not found.' });
  }

  const tokenExists = user.refreshTokens.some(rt => rt.token === token);
  if (!tokenExists) {
    return res.status(401).json({ success: false, message: 'Invalid or revoked refresh token.' });
  }

  // Rotate refresh token: remove old, issue new
  user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== token);
  const newRefreshToken = generateRefreshToken(user._id);
  user.refreshTokens.push({ token: newRefreshToken });

  try {
    await user.save();
  } catch (error) {
    if (error.name === 'VersionError') {
      // Race condition (e.g. React Strict Mode double-mount)
      // Another request already rotated the token. Return 401 cleanly.
      return res.status(401).json({ success: false, message: 'Token rotation race condition detected.' });
    }
    throw error;
  }

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000
  });

  const newAccessToken = generateAccessToken(user._id, user.role, user.restaurantId);

  return sendResponse(res, 200, 'Access token refreshed', {
    accessToken: newAccessToken
  });
});

// @desc    Get Current User Profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  let restaurant = null;
  if (user.role === 'RESTAURANT_OWNER' && user.restaurantId) {
    restaurant = await Restaurant.findById(user.restaurantId);
  }

  return sendResponse(res, 200, 'User profile retrieved', {
    user,
    restaurant
  });
});

// @desc    Change Password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Please provide current and new passwords.' });
  }

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Incorrect current password.' });
  }

  user.password = newPassword;
  await user.save();

  return sendResponse(res, 200, 'Password updated successfully.');
});

// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // Read refreshToken from httpOnly cookie
  const token = req.cookies?.refreshToken;
  if (token) {
    // Server-side revocation: remove from DB
    req.user.refreshTokens = req.user.refreshTokens.filter(rt => rt.token !== token);
    await req.user.save();
  }
  // Clear the httpOnly cookie
  res.clearCookie('refreshToken', { httpOnly: true, sameSite: 'Strict' });
  return sendResponse(res, 200, 'Logged out successfully.');
});

module.exports = {
  login,
  refreshToken,
  getMe,
  changePassword,
  logout
};
