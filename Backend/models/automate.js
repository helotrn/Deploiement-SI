const pool = require('../config/database');

module.exports = {
  async getAll() {
    const conn = await pool.getConnection();
    try {
      return await conn.query('SELECT * FROM automates');
    } finally {
      conn.release();
    }
  },
  async getById(id) {
    const conn = await pool.getConnection();
    try {
      return (await conn.query('SELECT * FROM automates WHERE id=?', [id]))[0];
    } finally {
      conn.release();
    }
  },
  async create(data) {
    const conn = await pool.getConnection();
    try {
      const { nom, adresse_ip, emplacement, operateur } = data;
      // Les noms de colonnes DOIVENT correspondre à ta table
      const res = await conn.query(
        'INSERT INTO automates (nom, adresse_ip, emplacement, operateur) VALUES (?, ?, ?, ?)',
        [nom, adresse_ip, emplacement, operateur]
      );
      return res.insertId;
    } finally {
      conn.release();
    }
  }
};
