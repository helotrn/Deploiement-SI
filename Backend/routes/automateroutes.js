const express = require('express');
const router = express.Router();
const automateController = require('../controllers/automatecontroller');

router.get('/', automateController.getAll);
router.get('/:id', automateController.getById);
router.post('/', automateController.create);
router.get('/modbus', automateController.getAutomateData);

module.exports = router;
