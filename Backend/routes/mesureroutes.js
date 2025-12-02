// Backend/routes/mesureroutes.js
const express = require('express');
const router = express.Router();
const mesureController = require('../controllers/mesurecontroller');

// Historique par variable
router.get('/', mesureController.getByVariable);

// Dernières mesures par automate (pour dashboard/historique)
router.get('/par-automate', mesureController.getLastByAutomate);

// Export CSV (variable_id dans query)
router.get('/export/csv', mesureController.exportCSV);

module.exports = router;
