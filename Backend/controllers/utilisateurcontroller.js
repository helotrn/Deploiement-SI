const Utilisateur = require('../models/utilisateur');

module.exports = {
  async getAll(req, res) {
    try {
      const users = await Utilisateur.getAll();
      res.json(users);
    } catch (err) {
      console.error('Erreur getAll utilisateurs:', err);
      res.status(500).json({ message: 'Erreur serveur utilisateurs' });
    }
  },

  async getById(req, res) {
    try {
      const user = await Utilisateur.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json(user);
    } catch (err) {
      console.error('Erreur getById utilisateurs:', err);
      res.status(500).json({ message: 'Erreur serveur utilisateurs' });
    }
  },

  async create(req, res) {
    try {
      const id = await Utilisateur.create(req.body);
      res.status(201).json({ id });
    } catch (err) {
      console.error('Erreur create utilisateur:', err);
      res.status(500).json({ message: 'Erreur serveur utilisateurs' });
    }
  }
};
