// Backend/routes/automateroutes.js
const express = require('express');
const router = express.Router();
const automateController = require('../controllers/automatecontroller');

// Liste de tous les automates
router.get('/', automateController.getAll);

// Un automate par id
router.get('/:id', automateController.getById);

// Création
router.post('/', automateController.create);

// Suppression
router.delete('/:id', automateController.remove);

module.exports = router;
