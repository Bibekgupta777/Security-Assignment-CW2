const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
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
  verifyOtp, // ✅ added
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");
const { isAdmin } = require("../middleware/isAdmin");
const { uploadUserAvatar } = require("../config/multerConfig");

router.post("/sign-up", signUp);
router.post("/sign-in", signIn);
router.post("/verify-otp", verifyOtp); // ✅ added
router.get("/get-user-by-id/:id", getUserById);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/uploadImage", uploadUserAvatar, uploadImage);
router.put("/:id", authenticateToken, updateUserProfile);

// Admin Routes
router.get("/all", authenticateToken, isAdmin, getAllUsers);
router.put("/:id/role", authenticateToken, isAdmin, updateUserRole);
router.delete("/:id", authenticateToken, isAdmin, deleteUser);

// Logout Route - destroys session and clears cookie
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Failed to logout" });
    }
    res.clearCookie("sid", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    res.status(200).json({ message: "Logged out successfully" });
  });
});

module.exports = router;
