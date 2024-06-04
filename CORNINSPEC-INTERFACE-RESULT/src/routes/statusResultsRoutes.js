const express = require('express');
const { authenticateToken } = require('../middleware/authenticateToken');
const { createStatusResult, getStatusResults, updateStatusResult, deleteStatusResult } = require('../models/statusResultsModel');

const router = express.Router();

router.post('/', authenticateToken, async (req, res) => {
    console.log('Received POST request with headers:', req.headers);
    console.log('Received POST request with body:', req.body);

    const { inspectionResults } = req.body;

    if (!inspectionResults) {
        console.log('Invalid data format: inspectionResults is missing');
        return res.status(400).json({ message: 'Invalid data format' });
    }

    const { status, requestRef, inspLot, pointData } = inspectionResults;

    console.log('Processing inspectionResults:', inspectionResults);

    try {
        for (const point of pointData) {
            const { operation, sampleNo, userc1, userc2, usern1, usern2, userd1, usert1, equipment, functLoc, message } = point;

            console.log('Processing point:', point);

            try {
                await createStatusResult(
                    status, requestRef, inspLot, operation, sampleNo, userc1, userc2, usern1, usern2, userd1, usert1, equipment, functLoc, message[0].msg
                );
                console.log('Status result created for sampleNo:', sampleNo);
            } catch (dbError) {
                console.error('Database error:', dbError);
                return res.status(500).json({ samples: { status: 'E', message: 'Database Error', requestRef, inspLot } });
            }
        }

        res.json({ samples: { status: 'S', message: 'Success', requestRef, inspLot } });
        console.log('Response sent: Success');
    } catch (error) {
        console.error('Error processing status-results:', error);
        res.status(500).json({ samples: { status: 'E', message: 'Internal Server Error', requestRef, inspLot } });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    console.log('Received GET request');

    try {
        const results = await getStatusResults();
        res.json({ status: 'S', message: 'Success', data: results });
        console.log('Response sent: Success');
    } catch (error) {
        console.error('Error retrieving status results:', error);
        res.status(500).json({ status: 'E', message: 'Internal Server Error' });
    }
});

module.exports = router;
