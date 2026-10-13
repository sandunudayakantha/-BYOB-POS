const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/errorHandler');
const { authLimiter, publicMenuLimiter, globalLimiter } = require('./middleware/rateLimiter');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ownerRoutes = require('./routes/ownerRoutes');
const branchRoutes = require('./routes/branchRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const menuRoutes = require('./routes/menuRoutes');
const menuItemRoutes = require('./routes/menuItemRoutes');
const featuredRoutes = require('./routes/featuredRoutes');
const qrRoutes = require('./routes/qrRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();

// Trust proxy for rate limiters (Render/Vercel load balancers)
app.set('trust proxy', 1);

// Global Middlewares & Security Hardening
app.use(helmet({ contentSecurityPolicy: false }));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. mobile apps, server-to-server, curl) or matched origins
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS Policy: Origin not allowed by security configuration.'));
  },
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// NoSQL Injection Sanitization (strips $ and . from incoming user input keys)
app.use(mongoSanitize());

// Rate Limiting Middlewares
app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/public', publicMenuLimiter);

// API Endpoints
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/menu-items', menuItemRoutes);
app.use('/api/featured', featuredRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/public', publicRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Restaurant QR Menu System API is operational',
    timestamp: new Date()
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
