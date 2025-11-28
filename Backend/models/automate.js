// Backend/models/automate.js
const pool = require('../config/database');

module.exports = {
  async getAll() {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        'SELECT id, nom, adresse_ip, emplacement, operateur, date_modif FROM automates'
      );

      // On s'assure que tout est sérialisable en JSON
      return rows.map(a => ({
        id: a.id != null ? Number(a.id) : null,
        nom: a.nom,
        adresse_ip: a.adresse_ip,
        emplacement: a.emplacement,
        operateur: a.operateur,
        date_modif: a.date_modif
          ? new Date(a.date_modif).toISOString()
          : null
      }));
    } finally {
      conn.release();
    }
  },

  async getById(id) {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        'SELECT id, nom, adresse_ip, emplacement, operateur, date_modif FROM automates WHERE id = ?',
        [id]
      );
      const a = rows[0];
      if (!a) return null;

      return {
        id: a.id != null ? Number(a.id) : null,
        nom: a.nom,
        adresse_ip: a.adresse_ip,
        emplacement: a.emplacement,
        operateur: a.operateur,
        date_modif: a.date_modif
          ? new Date(a.date_modif).toISOString()
          : null
      };
    } finally {
      conn.release();
    }
  },

  async create(data) {
    const conn = await pool.getConnection();
    try {
      const { nom, adresse_ip, emplacement, operateur } = data;

      const res = await conn.query(
        'INSERT INTO automates (nom, adresse_ip, emplacement, operateur) VALUES (?, ?, ?, ?)',
        [nom, adresse_ip, emplacement || null, operateur]
      );

      // insertId peut être un BigInt → on force en Number
      return Number(res.insertId);
    } finally {
      conn.release();
    }
  }
};
