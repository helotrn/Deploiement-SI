// Routes REST pour variables – /backend/routes/variableroutes.js
const router = require('express').Router();
const ctrl = require('../controllers/variablecontroller');
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
module.exports = router;
