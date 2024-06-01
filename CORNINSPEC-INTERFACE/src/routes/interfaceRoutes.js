const express = require('express');
const asyncHandler = require('express-async-handler');
const authenticateToken = require('../middleware/authenticateToken');
const { sendToQueue } = require('../middleware/rabbitMQProducer');
const { interfacePool } = require('../config/dbconfig');

const router = express.Router();

// POST /interface-sap route
router.post('/physical-data', authenticateToken, asyncHandler(async (req, res) => {
    try {
        const { inslot, batch, material, plant, operationno } = req.body;

        // Store data in the database
        const result = await interfacePool.query(
            'INSERT INTO interface.interface_requests (inslot, batch, material, plant, operationno) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [inslot, batch, material, plant, operationno]
        );

        const storedData = result.rows[0];

        // Data to send to RabbitMQ
        const data = {
            inslot: storedData.inslot,
            operationno: storedData.operationno,
            requestRef:storedData.request_ref
        };

        // Send data to RabbitMQ
        await sendToQueue(data);

        // Respond with success message
        res.json({ message: 'Data stored and sent to RabbitMQ successfully', data: storedData });
    } catch (error) {
        res.status(500).json({ message: 'Error processing request', error: error.message });
    }
}));

module.exports = router;