const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const asyncHandler = require("../middleware/async");
const { encrypt, decrypt } = require("../utils/encryption");

// Password validation function
function validatePassword(password) {
  const minLength = 8;
  const maxLength = 20;
  const uppercasePattern = /[A-Z]/;
  const lowercasePattern = /[a-z]/;
  const numberPattern = /[0-9]/;
  const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;

  if (password.length < minLength || password.length > maxLength) {
    return {
      valid: false,
      message: `Password must be between ${minLength} and ${maxLength} characters long.`,
    };
  }
  if (!uppercasePattern.test(password)) {
    return { valid: false, message: "Password must include at least one uppercase letter." };
  }
  if (!lowercasePattern.test(password)) {
    return { valid: false, message: "Password must include at least one lowercase letter." };
  }
  if (!numberPattern.test(password)) {
    return { valid: false, message: "Password must include at least one number." };
  }
  if (!specialCharPattern.test(password)) {
    return { valid: false, message: "Password must include at least one special character." };
  }

  return { valid: true };
}

// Check if new password was recently used
const isPasswordReused = async (newPassword, passwordHistory) => {
  for (const oldHashed of passwordHistory) {
    const match = await bcrypt.compare(newPassword, oldHashed);
    if (match) return true;
  }
  return false;
};

// Constants for brute-force prevention
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes in ms

// ✅ User Sign-Up
const signUp = async (req, res) => {
  try {
    const { name, email, password, avatar, phone, address } = req.body;

    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Validate password complexity
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Hash password
    const hashedPass = await bcrypt.hash(password, 10);

    // Create user with password history and lock fields initialized
    const newUser = new User({
      name,
      email,
      password: hashedPass,
      avatar,
      phone: phone ? encrypt(phone) : undefined,
      address: address ? encrypt(address) : undefined,
      passwordHistory: [hashedPass], // initialize with current password
      passwordChangedAt: new Date(),
      failedLoginAttempts: 0,
      lockUntil: null,
    });

    const data = await newUser.save();

    // Send welcome email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Welcome to Lets Go",
      html: `<h1>Your Registration has been completed</h1><p>Your user id is ${newUser.id}</p>`,
    });

    res.status(201).json({ message: "User saved successfully", data });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

// ✅ Upload image handler
const uploadImage = asyncHandler(async (req, res, next) => {
  if (!req.file) {
    return res.status(400).send({ message: "Please upload a file" });
  }
  res.status(200).json({
    success: true,
    data: req.file.filename,
  });
});

// ✅ User Sign-In with secure session & brute-force prevention
const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    // Check if account is locked
    if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
      const lockMinutes = Math.ceil((existingUser.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        message: `Account locked due to too many failed login attempts. Try again in ${lockMinutes} minute(s).`,
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, existingUser.password);
    if (!isMatch) {
      existingUser.failedLoginAttempts = (existingUser.failedLoginAttempts || 0) + 1;

      if (existingUser.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
        existingUser.lockUntil = new Date(Date.now() + LOCK_TIME);
      }

      await existingUser.save();

      let msg = "Invalid Credentials";
      if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
        const lockMinutes = Math.ceil((existingUser.lockUntil - Date.now()) / 60000);
        msg = `Account locked due to too many failed login attempts. Try again in ${lockMinutes} minute(s).`;
      } else {
        const attemptsLeft = MAX_LOGIN_ATTEMPTS - existingUser.failedLoginAttempts;
        if (attemptsLeft > 0) {
          msg = `Invalid Credentials. You have ${attemptsLeft} attempt(s) left before your account is locked.`;
        }
      }
      return res.status(400).json({ message: msg });
    }

    // ✅ Reset failed login attempts and lock
    existingUser.failedLoginAttempts = 0;
    existingUser.lockUntil = null;
    await existingUser.save();

    // ✅ Password expiry check (90 days)
    if (existingUser.passwordChangedAt) {
      const expiryDays = 90;
      const expiryDate = new Date(existingUser.passwordChangedAt);
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      if (expiryDate < new Date()) {
        return res.status(403).json({
          message: "Your password has expired. Please reset your password.",
          passwordExpired: true,
        });
      }
    }

    // ✅ Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        console.error("Session regeneration failed:", err);
        return res.status(500).json({ message: "Login failed due to session error" });
      }

      // ✅ Store minimal user info in session
      req.session.user = {
        id: existingUser._id,
        email: existingUser.email,
        role: existingUser.role,
      };

      res.status(200).json({
        message: "Login successful",
        user: {
          id: existingUser._id,
          email: existingUser.email,
          role: existingUser.role,
        },
        sessionId: req.session.id,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

// ✅ Get user info by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await User.findById(id).select("-password");
    if (!data) return res.status(404).json({ message: "User not found" });

    const userObj = data.toObject();
    userObj.phone = decrypt(userObj.phone);
    userObj.address = decrypt(userObj.address);

    return res.status(200).json(userObj);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    const decryptedUsers = users.map((user) => {
      const userObj = user.toObject();
      userObj.phone = decrypt(userObj.phone);
      userObj.address = decrypt(userObj.address);
      return userObj;
    });

    res.status(200).json({
      success: true,
      data: decryptedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve users",
      error,
    });
  }
};

// ✅ Update user role (admin only)
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role provided",
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error,
    });
  }
};

// ✅ Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error,
    });
  }
};

// ✅ Forgot Password - send reset link
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User with this email does not exist",
      });
    }

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h1>You requested a password reset</h1>
        <p>Click this link to reset your password:</p>
        <a href="${resetUrl}" clicktracking=off>${resetUrl}</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Error sending reset email",
    });
  }
};

// ✅ Reset Password
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    const reused = await isPasswordReused(newPassword, user.passwordHistory);
    if (reused) {
      return res.status(400).json({
        success: false,
        message: "You cannot reuse a recent password.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.passwordHistory.unshift(user.password);
    if (user.passwordHistory.length > 5) {
      user.passwordHistory.pop();
    }

    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Error resetting password",
    });
  }
};

// ✅ Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, address } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (req.user.id !== id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this profile",
      });
    }

    const encryptedPhone = phone ? encrypt(phone) : user.phone;
    const encryptedAddress = address ? encrypt(address) : user.address;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        name: name || user.name,
        email: email || user.email,
        phone: encryptedPhone,
        address: encryptedAddress,
      },
      { new: true, runValidators: true }
    ).select("-password");

    const userObj = updatedUser.toObject();
    userObj.phone = decrypt(userObj.phone);
    userObj.address = decrypt(userObj.address);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: userObj,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

module.exports = {
  signUp,
  signIn,
  uploadImage,
  getUserById,
  getAllUsers,
  updateUserRole,
  deleteUser,
  forgotPassword,
  resetPassword,
  updateUserProfile,
};
