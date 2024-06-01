// routes/interfaceRoutes.js
const express = require('express');
const router = express.Router();
const asyncHandler = require('express-async-handler');
const authenticateToken = require('../middleware/authenticateToken');
const { addInterface, getInterfaces, getInterfaceById, updateInterface, deleteInterface, getInterfacesByCriteria } = require('../models/interfaceModels');
const { sendToQueue } = require('../middleware/rabbitMQProceducer');

router.post('/', authenticateToken, asyncHandler(async (req, res) => {
    const { inslot, material, batch, plant, operationno } = req.body.data; // Assuming 'data' contains these fields
    const result = await addInterface(inslot, material, batch, plant, operationno);
    res.status(201).json(result);
}));


router.get('/', authenticateToken, asyncHandler(async (req, res) => {
    const results = await getInterfaces();
    res.json(results);
}));

router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const { inslot, material, batch, plant, operationno } = req.body.data; // Correctly extract fields from request body
    const result = await updateInterface(req.params.id, inslot, material, batch, plant, operationno);
    if (result) {
        res.json(result);
    } else {
        res.status(404).send('Interface not found');
    }
}));

router.put('/:id', authenticateToken, asyncHandler(async (req, res) => {
    const result = await updateInterface(req.params.id, req.body.data);
    if (result) {
        res.json(result);
    } else {
        res.status(404).send('Interface not found');
    }
}));

router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
    await deleteInterface(req.params.id);
    res.sendStatus(204); // No Content
}));

router.get('/search', async (req, res) => {
    const { inslot, batch, material, plant, operationno } = req.query;
    try {
        const interfaces = await getInterfacesByCriteria(inslot, batch, material, plant, operationno);
        await sendToQueue(interfaces);  // Send the fetched data to RabbitMQ
        res.json(interfaces);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Failed to fetch and send interface data', error: err.message });
    }
});

module.exports = router;
