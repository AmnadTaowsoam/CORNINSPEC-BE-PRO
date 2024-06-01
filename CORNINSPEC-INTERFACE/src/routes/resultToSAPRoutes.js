//src/routes/resultToSAPRoutes.js
const express = require('express');
const router = express.Router();
const { getInspections } = require('../models/inspectionsModel');
const axios = require('axios');
const { interfacePool } = require('../config/dbconfig');

// Route to get all inspections and send them to the frontend
router.get('/inspections', async (req, res) => {
    try {
        const inspections = await getInspections();
        res.status(200).json(inspections);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching inspections data', error: error.message });
    }
});

module.exports = router;
