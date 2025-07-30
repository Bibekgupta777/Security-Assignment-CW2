const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 30 * 60 * 1000;

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Password validation function
const validatePassword = (password) => {
  const errors = [];
  
  // Check minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  
  // Check maximum length
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }
  
  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  
  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  
  // Check for number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }
  
  // Check for special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character (!@#$%^&*(),.?\":{}|<>)");
  }
  
  // Check for common weak passwords
  const commonPasswords = [
    "password", "123456", "123456789", "qwerty", "abc123", 
    "password123", "admin", "letmein", "welcome", "monkey"
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push("Password is too common. Please choose a stronger password");
  }
  
  // Check for sequential characters
  if (/123456|abcdef|qwerty/i.test(password)) {
    errors.push("Password should not contain sequential characters");
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

const signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "All fields are required",
        errors: ["Name, email, and password are required"] 
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        message: "Invalid email format",
        errors: ["Please provide a valid email address"] 
      });
    }
    
    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: "Password validation failed",
        errors: passwordValidation.errors 
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists",
        errors: ["An account with this email already exists"] 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Sign up error:", error);
    res.status(500).json({ 
      message: "Error signing up user", 
      errors: ["Internal server error. Please try again later."] 
    });
  }
};

const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    if (existingUser.lockUntil && existingUser.lockUntil > Date.now()) {
      const lockMinutes = Math.ceil((existingUser.lockUntil - Date.now()) / 60000);
      return res.status(403).json({
        message: `Account locked due to too many failed login attempts. Try again in ${lockMinutes} minute(s).`,
      });
    }

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
        msg = `Account locked. Try again in ${lockMinutes} minute(s).`;
      } else {
        const attemptsLeft = MAX_LOGIN_ATTEMPTS - existingUser.failedLoginAttempts;
        if (attemptsLeft > 0) {
          msg = `Invalid Credentials. You have ${attemptsLeft} attempt(s) left.`;
        }
      }
      return res.status(400).json({ message: msg });
    }

    existingUser.failedLoginAttempts = 0;
    existingUser.lockUntil = null;

    if (!existingUser.isVerified) {
      const otpCode = generateOtp();
      const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      existingUser.otp = { code: otpCode, expiresAt: otpExpiry };
      await existingUser.save();

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
        to: existingUser.email,
        subject: "OTP Verification - Lets Go",
        html: `<p>Your OTP is: <b>${otpCode}</b>. It will expire in 5 minutes.</p>`,
      });

      return res.status(200).json({
        message: "OTP sent to your email",
        otpRequired: true,
        email: existingUser.email,
      });
    }

    // Generate JWT token here
    const token = jwt.sign(
      { id: existingUser._id, email: existingUser.email, role: existingUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed due to session error" });
      }

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
          token,  // <-- Add token here
        },
        sessionId: req.session.id,
      });
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.otp && user.otp.code === otp && user.otp.expiresAt > Date.now()) {
      user.isVerified = true;
      user.otp = undefined;
      user.failedLoginAttempts = 0;
      user.lockUntil = null;
      await user.save();

      // Generate JWT token here
      const token = jwt.sign(
        { id: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      req.session.regenerate((err) => {
        if (err) {
          return res.status(500).json({ message: "Session error after OTP verification" });
        }

        req.session.user = {
          id: user._id,
          email: user.email,
          role: user.role,
        };

        return res.status(200).json({
          message: "OTP verified and login successful",
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,  // <-- Add token here
          },
          sessionId: req.session.id,
        });
      });
    } else {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).json({ message: "Server error verifying OTP" });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User role updated", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating user role", error });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
    user.otp = { code: otpCode, expiresAt: otpExpiry };
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

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP - Lets Go",
      html: `<p>Your password reset OTP is: <b>${otpCode}</b>. It will expire in 5 minutes.</p>`
    });

    res.status(200).json({ message: "OTP sent to your email for password reset" });
  } catch (error) {
    res.status(500).json({ message: "Error processing forgot password", error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.otp || user.otp.code !== otp || user.otp.expiresAt < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ 
        message: "Password validation failed",
        errors: passwordValidation.errors 
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password", error });
  }
};

const uploadImage = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.image = req.file.filename;
    await user.save();
    res.status(200).json({ message: "Image uploaded successfully", image: req.file.filename });
  } catch (error) {
    res.status(500).json({ message: "Error uploading image", error });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error });
  }
};

module.exports = {
  signUp,
  signIn,
  getUserById,
  getAllUsers,
  updateUserRole,
  deleteUser,
  forgotPassword,
  resetPassword,
  uploadImage,
  updateUserProfile,
  verifyOtp,
};