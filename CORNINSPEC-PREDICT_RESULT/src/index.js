// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const scheduleDeleteOldRecords = require('./tasks/deleteOldRecords');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();

app.use(express.json());
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    optionsSuccessStatus: 200
}));
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

const authRoutes = require('./routes/authRoutes');
const resultRoutes = require('./routes/resultRoutes');
const interfaceRoutes = require('./routes/interfaceRoutes');

app.use('/api/auth', authRoutes);
app.use('/results', authenticateToken, resultRoutes);
app.use('/interfaces', authenticateToken, interfaceRoutes);

// Initialize scheduled tasks
scheduleDeleteOldRecords();

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.PORT || 8007;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))