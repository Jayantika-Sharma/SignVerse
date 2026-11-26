const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiResponse = require('../utils/ApiResponse');

exports.register = async (req, res) => {
  try {
    const { name, email, password, outputPreference, preferredSignLanguage } = req.body;

    if (!name || !email || !password) {
      return ApiResponse.error(res, 'Please provide name, email, and password', 400);
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return ApiResponse.error(res, 'An account with this email already exists', 400);
    }

    const user = await User.create({
      name,
      email,
      password,
      outputPreference: outputPreference || 'both',
      preferredSignLanguage: preferredSignLanguage || 'ASL',
    });

    const token = generateToken(user._id);

    return ApiResponse.success(
      res,
      'User registered successfully',
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          outputPreference: user.outputPreference,
          preferredSignLanguage: user.preferredSignLanguage,
        },
        token,
      },
      201
    );
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiResponse.error(res, 'Please provide both email and password', 400);
    }

    // Include password field explicitly (since select: false in model)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, 'Invalid credentials', 401);
    }

    user.isOnline = true;
    await user.save();

    const token = generateToken(user._id);

    return ApiResponse.success(res, 'Logged in successfully', {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        outputPreference: user.outputPreference,
        preferredSignLanguage: user.preferredSignLanguage,
      },
      token,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    return ApiResponse.success(res, 'User profile retrieved', { user });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};

exports.updatePreferences = async (req, res) => {
  try {
    const { outputPreference, preferredSignLanguage } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return ApiResponse.error(res, 'User not found', 404);
    }

    if (outputPreference) user.outputPreference = outputPreference;
    if (preferredSignLanguage) user.preferredSignLanguage = preferredSignLanguage;

    await user.save();

    return ApiResponse.success(res, 'Preferences updated successfully', {
      outputPreference: user.outputPreference,
      preferredSignLanguage: user.preferredSignLanguage,
    });
  } catch (error) {
    return ApiResponse.error(res, error.message, 500);
  }
};