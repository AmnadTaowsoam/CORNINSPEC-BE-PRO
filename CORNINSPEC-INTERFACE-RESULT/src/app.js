const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { authenticateToken } = require('./middleware/authenticateToken');
const deleteOldRecords = require('./tasks/deleteOldRecords');
const schedule = require('node-schedule');

dotenv.config({ path: require('path').resolve(__dirname, '../.env') });

const app = express();

if (!process.env.ALLOWED_ORIGINS) {
    throw new Error("ALLOWED_ORIGINS is not defined in the environment variables");
}

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    optionsSuccessStatus: 200
}));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const statusResultsRoutes = require('./routes/statusResultsRoutes');

// Remove authRoutes as they are no longer needed
// app.use('/api/auth', authRoutes);

app.use('/status-results', authenticateToken, statusResultsRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Something broke!', error: err.message });
});

const PORT = process.env.STATUS_RESULTS_SERVICE_PORT || 8005;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

schedule.scheduleJob('0 0 * * *', async () => {
    try {
        await deleteOldRecords();
        console.log('Scheduled task: Old records deletion completed.');
    } catch (error) {
        console.error('Error executing scheduled deletion task:', error.message);
    }
});
