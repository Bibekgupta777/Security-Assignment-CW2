const sessionAuth = (req, res, next) => {
  if (req.session && req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized: Please login to access this resource." });
  }
};

module.exports = sessionAuth;
