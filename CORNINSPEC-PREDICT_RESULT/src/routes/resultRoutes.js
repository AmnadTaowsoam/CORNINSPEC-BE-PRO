const express = require('express');
const router = express.Router();
const resultModel = require('../models/resultModels');

router.get('/', async (req, res) => {
  try {
    const results = await resultModel.getAllResults();
    res.json(results);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const result = await resultModel.createResult(req.body.data);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

router.get('/results', async (req, res) => {
  const { inslot, batch, material, plant, operationno } = req.query;
  try {
      const results = await resultModel.getResultsByCriteria(inslot, batch, material, plant, operationno);
      res.json(results);
  } catch (err) {
      res.status(500).send(err.message);
  }
});

module.exports = router;
