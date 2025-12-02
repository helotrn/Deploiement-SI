// Backend/controllers/automatecontroller.js

const Automate = require('../models/automate');
const Variable = require('../models/variable');
const Mesure = require('../models/mesure');

module.exports = {
  // GET /api/automates
  async getAll(req, res) {
    try {
      const automates = await Automate.getAll();
      res.json(automates);
    } catch (err) {
      console.error('Erreur getAll automates:', err);
      res.status(500).json({ message: 'Erreur serveur automates' });
    }
  },

  // GET /api/automates/:id
  async getById(req, res) {
    try {
      const automate = await Automate.getById(req.params.id);
      if (!automate) {
        return res.status(404).json({ message: 'Automate non trouvé' });
      }
      res.json(automate);
    } catch (err) {
      console.error('Erreur getById automate:', err);
      res.status(500).json({ message: 'Erreur serveur automates' });
    }
  },

  // POST /api/automates
  async create(req, res) {
    try {
      const { nom, adresse_ip, emplacement, operateur } = req.body;

      if (!nom || !adresse_ip) {
        return res.status(400).json({ message: 'nom et adresse_ip sont obligatoires' });
      }

      const id = await Automate.create({
        nom,
        adresse_ip,
        emplacement: emplacement || null,
        operateur: operateur || null
      });

      res.status(201).json({ id });
    } catch (err) {
      console.error('Erreur create automate:', err);
      res.status(500).json({ message: 'Erreur serveur automates' });
    }
  },

  // DELETE /api/automates/:id
  async remove(req, res) {
    const id = req.params.id;

    try {
      const automate = await Automate.getById(id);
      if (!automate) {
        return res.status(404).json({ message: 'Automate non trouvé' });
      }

      // 1) Récupérer les variables liées à cet automate
      const variables = await Variable.getAll({ automate_id: id });

      // 2) Supprimer les mesures associées à ces variables
      if (variables && variables.length) {
        const variableIds = variables.map(v => v.id);
        await Mesure.deleteByVariableIds(variableIds);
      }

      // 3) Supprimer les variables de cet automate
      await Variable.deleteByAutomateId(id);

      // 4) Supprimer l’automate
      await Automate.delete(id);

      res.status(204).end();
    } catch (err) {
      console.error('Erreur delete automate:', err);
      res.status(500).json({ message: 'Erreur serveur lors de la suppression' });
    }
  }
};
