// Example brute force protection middleware
// Here you can add logic to check repeated failed attempts stored in DB or cache
// For now, this is a placeholder middleware that just calls next()

function bruteForceProtection(req, res, next) {
  // You can add your logic here (e.g., IP check, DB check for failed attempts, etc.)
  next();
}

module.exports = bruteForceProtection;
