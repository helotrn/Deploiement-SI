const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/utilisateurcontroller');

// GET /api/utilisateurs
router.get('/', ctrl.getAll);

// GET /api/utilisateurs/:id
router.get('/:id', ctrl.getById);

// POST /api/utilisateurs
router.post('/', ctrl.create);

module.exports = router;
