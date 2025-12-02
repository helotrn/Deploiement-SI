// Backend/controllers/mesurecontroller.js

const Mesure = require('../models/mesure');
const Variable = require('../models/variable');
const Automate = require('../models/automate');

module.exports = {
  // GET /api/mesures?variable_id=...&limit=100
  async getByVariable(req, res) {
    try {
      const { variable_id, limit } = req.query;
      if (!variable_id) {
        return res.status(400).json({ message: 'variable_id est obligatoire' });
      }

      const max = Number(limit) || 100;
      const mesures = await Mesure.getByVariable(variable_id, max);

      res.json(mesures);
    } catch (err) {
      console.error('Erreur getByVariable mesures:', err);
      res.status(500).json({ message: 'Erreur serveur mesures' });
    }
  },

  // GET /api/mesures/par-automate?automate_id=...
  async getLastByAutomate(req, res) {
    try {
      const { automate_id } = req.query;
      if (!automate_id) {
        return res.status(400).json({ message: 'automate_id est obligatoire' });
      }

      const variables = await Variable.getAll({ automate_id });
      if (!variables.length) {
        return res.json([]);
      }

      const result = [];
      for (const v of variables) {
        const last = await Mesure.getLastForVariable(v.id);
        if (last) {
          result.push({
            variable_id: v.id,
            variable_nom: v.nom,
            type: v.type,
            unite: v.unite,
            valeur: last.valeur,
            date_mesure: last.date_mesure
          });
        }
      }

      res.json(result);
    } catch (err) {
      console.error('Erreur getLastByAutomate:', err);
      res.status(500).json({ message: 'Erreur serveur mesures' });
    }
  },

  // GET /api/exports/csv?variable_id=...
  async exportCSV(req, res) {
    try {
      const { variable_id } = req.query;
      if (!variable_id) {
        return res.status(400).json({ message: 'variable_id est obligatoire' });
      }

      const variable = await Variable.getById(variable_id);
      if (!variable) {
        return res.status(404).json({ message: 'Variable non trouvée' });
      }

      const mesures = await Mesure.getByVariable(variable_id, 1000);

      let csv = 'date_mesure;valeur\n';
      for (const m of mesures) {
        csv += `${m.date_mesure};${m.valeur}\n`;
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="mesures_variable_${variable_id}.csv"`
      );
      res.send(csv);
    } catch (err) {
      console.error('Erreur exportCSV:', err);
      res.status(500).json({ message: 'Erreur serveur export CSV' });
    }
  }
};
