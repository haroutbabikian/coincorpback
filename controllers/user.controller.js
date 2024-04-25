const { userService, walletService } = require("../services");
const httpStatus = require("http-status");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const catchAsync = require("../utils/catchasync");
const UnAuthorizedError = require("../utils/errors/unauthorized.error");

const register = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, errors: errors.array() });
  }
  const { first_name, last_name, email, password, phone_number } = req.body;

    // Create user with phone number
    const user = await userService.createUser({
      first_name,
      last_name,
      email,
      password,
      phone_number,
    });

    // Create wallet for the user
    await walletService.createWallet(user[0]);

    return res.status(httpStatus.CREATED).send({
      success: true,
      message: "Registered successfully!",
    });
});

const login = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ success: false, errors: errors.array() });
  }
  const { email, password } = req.body;

  // Find user by email or phone number
  const user = await userService.findUserByEmail(email);

  if (!user) {
    throw new UnAuthorizedError("Invalid email or password");
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new UnAuthorizedError("Invalid email or password");
  }

  const payload = {
    id: user.id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    phone_number: user.phone_number,
  };

  const token = jwt.sign(payload, jwtConfig.appKey, {
    expiresIn: "1h",
  });

  return res.status(httpStatus.OK).send({
    success: true,
    message: "Logged in successfully!",
    results: payload,
    token,
  });
});

const getProfile = catchAsync(async (req, res) => {
  const user = await userService.getProfile(req.user);

  return res.status(httpStatus.OK).send({
    success: true,
    message: "Returned profile successfully",
    result: user,
  });
});

const checkPhoneNumber = async (req, res) => {
  try {
    const { phone_number } = req.body;

    // Perform a check if the phone number already exists in the database
    const user = await userService.findUserByPhoneNumber(phone_number);

    // If user exists, return true, otherwise return false
    const exists = !!user;
    
    res.json({ exists });
  } catch (error) {
    console.error('Error checking phone number:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  checkPhoneNumber
};
