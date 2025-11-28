const Automate = require('../models/automate');

exports.getAll = async (req, res, next) => {
  try {
    const rows = await Automate.getAll();
    res.json(rows);
  } catch (e) {
    console.error('Erreur getAll automates :', e.message);
    res.status(500).json({ message: e.message });
  }
};

exports.getById = async (req, res, next) => {
  try {
    const automate = await Automate.getById(req.params.id);
    if (!automate) {
      return res.status(404).json({ message: 'Automate non trouvé' });
    }
    res.json(automate);
  } catch (e) {
    console.error('Erreur getById automate :', e.message);
    res.status(500).json({ message: e.message });
  }
};

exports.create = async (req, res, next) => {
  try {
    const { nom, adresse_ip, emplacement, operateur } = req.body;
    if (!nom || !adresse_ip || !operateur) {
      return res.status(400).json({ message: 'Champs obligatoires manquants' });
    }
    const id = await Automate.create({ nom, adresse_ip, emplacement, operateur });
    res.status(201).json({ id });
  } catch (e) {
    console.error('Erreur create automate :', e.message);
    res.status(500).json({ message: e.message });
  }
};
