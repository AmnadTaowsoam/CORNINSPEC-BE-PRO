// routes/webhookRoutes.js

const express = require('express');
const { interfacePool } = require('../config/dbconfig');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

router.post('/status-results', authenticateToken, async (req, res) => {
    const { inspectionResults } = req.body;

    if (!inspectionResults) {
        return res.status(400).json({ message: 'Invalid data format' });
    }

    const { status, requestRef, inspLot, pointData } = inspectionResults;

    try {
        for (const point of pointData) {
            const { operation, sampleNo, mic, result, message } = point;

            // Update inspection results in the database
            await interfacePool.query(
                'UPDATE interface.inspections SET status = $1, message = $2 WHERE request_ref = $3 AND insp_lot = $4 AND operation = $5 AND sample_no = $6 AND mic = $7',
                [status, message.join(', '), requestRef, inspLot, operation, sampleNo, mic]
            );
        }

        res.json({ status: 'S', message: 'Success', requestRef, inspLot });
    } catch (error) {
        console.error('Error processing status-results:', error);
        res.status(500).json({ status: 'E', message: 'Internal Server Error', requestRef, inspLot });
    }
});

module.exports = router;
