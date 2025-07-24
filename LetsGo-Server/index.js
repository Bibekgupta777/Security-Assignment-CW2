require("dotenv").config();
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
const fs = require("fs");
const https = require("https");
const http = require("http");
const connectDB = require("./config/db");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const {
  generalLimiter,
  loginLimiter,
  authLimiter,
  adminLimiter,
  paymentLimiter,
  contactLimiter,
  passwordResetLimiter,
} = require("./middleware/rateLimiter");

const bruteForceProtection = require("./middleware/bruteForceProtection");

const app = express();

// ✅ Connect to DB
connectDB();

const PORT = process.env.PORT || 5001; // HTTP port
const SSL_PORT = process.env.SSL_PORT || 5443; // HTTPS port

// ✅ Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: "https://localhost:4004", // frontend origin
    credentials: true, // allow cookies to be sent
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.set("trust proxy", 1);

// ✅ Secure Session Management
app.use(
  session({
    name: "sid",
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URI,
      collectionName: "sessions",
      ttl: 60 * 30, // 30 min session expiration in DB
    }),
    cookie: {
      httpOnly: true,
      secure: true,             // must be true with sameSite: 'none' and HTTPS
      maxAge: 30 * 60 * 1000,  // 30 minutes
      sameSite: "none",        // allow cross-site cookie
      path: "/",
    },
    rolling: true, // Refresh cookie expiration on every request
  })
);

// ✅ Automatic Session Expiration Middleware
app.use((req, res, next) => {
  if (!req.session) return next();

  const now = Date.now();
  const maxIdleTime = 30 * 60 * 1000; // 30 min idle timeout

  if (!req.session.lastActivity) {
    req.session.lastActivity = now;
  } else if (now - req.session.lastActivity > maxIdleTime) {
    req.session.destroy((err) => {
      if (err) console.error("Session auto-expire error:", err);
    });
    res.clearCookie("sid", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });
    return res.status(440).json({ message: "Session expired, please login again" });
  }

  req.session.lastActivity = now;
  next();
});

// ✅ Rate Limiters
app.use(generalLimiter);
app.use("/api/user/sign-in", loginLimiter, bruteForceProtection);
app.use("/api/user/sign-up", authLimiter);
app.use("/api/user/forgot-password", passwordResetLimiter);
app.use("/api/user/reset-password", passwordResetLimiter);
app.use("/api/admin", adminLimiter);
app.use("/api/payment", paymentLimiter);
app.use("/api/contact", contactLimiter);

// ✅ Import Routes
const userRoutes = require("./routes/userRoutes");
const busRoutes = require("./routes/busRoutes");
const seatRoutes = require("./routes/seatRoutes");
const routeRoutes = require("./routes/routeRoutes");
const scheduleRoutes = require("./routes/scheduleRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");
const contactRoutes = require("./routes/contactRoutes");

// ✅ Use Routes
app.use("/api/user", userRoutes);
app.use("/api/bus", busRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/route", routeRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/contact", contactRoutes);

// ✅ Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// ✅ 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ✅ HTTPS Options (mkcert)
const httpsOptions = {
  key: fs.readFileSync("./cert/localhost-key.pem"),
  cert: fs.readFileSync("./cert/localhost.pem"),
};

// ✅ HTTP → HTTPS Redirect
const forceHTTPSRedirect = (req, res) => {
  const host = req.headers.host.replace(/:\d+$/, `:${SSL_PORT}`);
  res.writeHead(301, { Location: `https://${host}${req.url}` });
  res.end();
};

// ✅ Start Servers
http.createServer(forceHTTPSRedirect).listen(PORT, () => {
  console.log(`✅ HTTP Server running on http://localhost:${PORT} (redirecting to HTTPS)`);
});

https.createServer(httpsOptions, app).listen(SSL_PORT, () => {
  console.log(`✅ HTTPS Server running on https://localhost:${SSL_PORT}`);
});
