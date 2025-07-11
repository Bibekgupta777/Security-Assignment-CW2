const User = require("../models/User");

const passwordExpiryMiddleware = (expiryDays = 90) => {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(401).json({ message: "User not found" });

      if (user.passwordChangedAt) {
        const expiryDate = new Date(user.passwordChangedAt);
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        if (expiryDate < new Date()) {
          return res.status(403).json({
            message:
              "Your password has expired. Please change your password to continue.",
          });
        }
      }

      next();
    } catch (err) {
      next(err);
    }
  };
};

module.exports = passwordExpiryMiddleware;
