require('dotenv').config();
const connectToMongo = require('./db');
var cors = require('cors')
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const path = require('path');
const port = process.env.PORT || 5000;

connectToMongo();

const app = express();

// Basic Request Logger
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(1)}ms`);
  });
  next();
});

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true in production with HTTPS
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowed = new Set([
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000'
    ].filter(Boolean));
    if (!origin || allowed.has(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '2mb' }));

// API routes
app.use("/api/auth", require("./router/auth"));
app.use("/api/auth", require("./router/googleAuth"));
app.use("/api/preferences", require("./router/preferences"));
app.use("/api/bookmarks", require("./router/bookmarks"));
app.use("/api/contact", require("./router/contact"));
app.use("/api/farming", require("./router/farming"));
app.use("/api/chat", require("./router/chat"));
// News app API routes
app.use("/api/news", require("./router/news"));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

// Static assets (frontend pages)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => { 
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
