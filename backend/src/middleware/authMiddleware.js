const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiResponse = require('../utils/ApiResponse');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return ApiResponse.error(res, 'User not found with this token', 401);
      }

      return next();
    } catch (error) {
      return ApiResponse.error(res, 'Not authorized, token invalid or expired', 401);
    }
  }

  if (!token) {
    return ApiResponse.error(res, 'Not authorized, no token provided', 401);
  }
};

module.exports = { protect };