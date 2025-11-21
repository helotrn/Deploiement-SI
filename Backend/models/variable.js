// Accès table "variables" – /backend/models/variable.js
const pool = require('../config/database');
module.exports = {
  async getAll(automate_id) {
    const conn = await pool.getConnection();
    try {
      return automate_id
        ? await conn.query('SELECT * FROM variables WHERE automate_id=?', [automate_id])
        : await conn.query('SELECT * FROM variables');
    } finally { conn.release(); }
  },
  async getById(id) {
    const conn = await pool.getConnection();
    try { return (await conn.query('SELECT * FROM variables WHERE id=?', [id]))[0]; }
    finally { conn.release(); }
  },
  async create(data) {
    const conn = await pool.getConnection();
    try {
      const { automate_id, nom, registre, unite, frequence } = data;
      const result = await conn.query(
        'INSERT INTO variables (automate_id, nom, registre, unite, frequence) VALUES (?, ?, ?, ?, ?)',
        [automate_id, nom, registre, unite, frequence]
      );
      return result.insertId;
    } finally { conn.release(); }
  }
};
