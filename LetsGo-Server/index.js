require("dotenv").config();
const cors = require("cors");
const express = require("express");
const helmet = require("helmet");
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

// Import routes
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

// Connect to DB
connectDB();

const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.set("trust proxy", 1); // if behind proxy (e.g. Heroku)

// Session middleware with rolling session expiration refresh
app.use(
  session({
    name: "sid", // custom cookie name
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_DB_URI,
      collectionName: "sessions",
      ttl: 60 * 60 * 24, // 1 day in seconds (session store expiration)
    }),
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour cookie expiration
      sameSite: "strict",
    },
    rolling: true, // refresh cookie expiration on each response
  })
);

// Apply general rate limiter to all requests
app.use(generalLimiter);

// Specific rate limiters for sensitive routes
app.use("/api/user/sign-in", loginLimiter, bruteForceProtection);
app.use("/api/user/sign-up", authLimiter);
app.use("/api/user/forgot-password", passwordResetLimiter);
app.use("/api/user/reset-password", passwordResetLimiter);
app.use("/api/admin", adminLimiter);
app.use("/api/payment", paymentLimiter);
app.use("/api/contact", contactLimiter);

// Use routes
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

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
