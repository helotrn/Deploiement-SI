// Backend/routes/mesureroutes.js
const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/mesurecontroller');

// GET /api/mesures         (?automateId=&limit=)
router.get('/', ctrl.getAllOrByAutomate);

// GET /api/mesures/ping?ip=...
router.get('/ping', ctrl.pingAutomate);

// GET /api/mesures/live?ip=...
router.get('/live', ctrl.liveMeasures);

// POST /api/mesures
router.post('/', ctrl.create);

module.exports = router;
