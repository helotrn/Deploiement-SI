const Variable = require('../models/variable');

module.exports = {
  async getAll(req, res) {
    try {
      const { automate_id } = req.query;
      const filters = {};

      if (automate_id) {
        filters.automate_id = automate_id;
      }

      const vars = await Variable.getAll(filters);
      res.json(vars);
    } catch (err) {
      console.error('Erreur getAll variables:', err);
      res.status(500).json({ message: 'Erreur serveur variables' });
    }
  },

  async getById(req, res) {
    try {
      const variable = await Variable.getById(req.params.id);
      if (!variable) {
        return res.status(404).json({ message: 'Variable non trouvée' });
      }
      res.json(variable);
    } catch (err) {
      console.error('Erreur getById variables:', err);
      res.status(500).json({ message: 'Erreur serveur variables' });
    }
  },

  async create(req, res) {
    try {
      const { nom, type, unite, description } = req.body;

      if (!nom || !type) {
        return res.status(400).json({ message: 'nom et type sont obligatoires' });
      }

      const id = await Variable.create({ nom, type, unite, description });
      res.status(201).json({ id });
    } catch (err) {
      console.error('Erreur create variable:', err);
      res.status(500).json({ message: 'Erreur serveur variables' });
    }
  }
};
