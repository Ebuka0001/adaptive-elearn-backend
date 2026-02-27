// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// security + rate limit
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// basic security headers
app.use(helmet());

// parse JSON with size limit (prevents huge bodies)
app.use(express.json({ limit: '200kb' }));
app.use(cors());

// basic rate limiter for all requests (tweak limits if needed)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                 // max requests per IP per window
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// connect DB
connectDB(process.env.MONGO_URI);

// simple health check
app.get('/', (req, res) => res.send({ ok: true, message: 'Adaptive elearn backend API' }));

app.use('/uploads', express.static('uploads'));

// routes (keep exactly as your project uses)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/attempts', require('./routes/attempts'));
app.use('/api/attempts-debug', require('./routes/attempts.debug'));
app.use('/api/gamification', require('./routes/gamification'));
app.use('/api/user', require('./routes/user'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/lecturer', require('./routes/lecturer'));
app.use('/api/enrollments', require('./routes/enrollment'));

// generic error handler (prevents stack traces leaking to clients)
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err && (err.stack || err.message) ? (err.stack || err.message) : err);
  res.status(500).json({ message: 'Server error' });
});

// start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
