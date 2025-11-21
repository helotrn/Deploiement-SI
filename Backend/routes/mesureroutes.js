// Routes REST pour mesures et lecture live – /backend/routes/mesureroutes.js
const router = require('express').Router();
const ctrl = require('../controllers/mesurecontroller');
router.get('/', ctrl.getAll);
router.get('/lire/:id', ctrl.lireEnDirect);
module.exports = router;
