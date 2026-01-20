// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const errorHandler = require('./middleware/errorHandler');
//
// const authRoutes = require('./routes/auth');
// const configRoutes = require('./routes/config');
// const lookupRoutes = require('./routes/lookups');
// const orderRoutes = require('./routes/orders');
// const reportRoutes = require('./routes/reports');
//
// const app = express();
//
// app.use(helmet());
// // app.use(cors({ origin: process.env.FRONTEND_URL }));
// app.use('*', cors());
// app.use(morgan('dev'));
// app.use(express.json());
//
// app.use('/api/auth', authRoutes);
// app.use('/api/config', configRoutes);
// app.use('/api/lookups', lookupRoutes);
// app.use('/api/orders', orderRoutes);
// app.use('/api/reports', reportRoutes);
//
// app.use(errorHandler);
//
// module.exports = app;

// src/app.js (Full Updated – Crash-Proof with express-async-errors + Enhanced Global Error Handler)

require('express-async-errors'); // MUST BE AT THE VERY TOP — catches all async errors

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/auth');
const configRoutes = require('./routes/config');
const lookupRoutes = require('./routes/lookups');
const orderRoutes = require('./routes/orders');
const reportRoutes = require('./routes/reports');

const app = express();

app.use(helmet());
// For development: Allow all origins (change to specific in production)
app.use(cors());
// Or restricted: app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/config', configRoutes);
app.use('/api/lookups', lookupRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reports', reportRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);

    // MongoDB duplicate key error (E11000)
    if (err.name === 'MongoServerError' && err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];
        return res.status(409).json({
            message: `${field.charAt(0).toUpperCase() + field.slice(1)} "${value}" already exists`,
        });
    }

    // Mongoose validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ message: messages.join(', ') });
    }

    // Stripe or other known errors
    if (err.message.includes('tampering') || err.message.includes('Payment amount mismatch')) {
        return res.status(400).json({ message: 'Invalid payment data' });
    }

    // Default fallback
    res.status(500).json({
        message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    });
});

module.exports = app;