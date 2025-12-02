const pool = require('../config/database');

module.exports = {
  async getAll(filters = {}) {
    const conn = await pool.getConnection();
    try {
      let sql = 'SELECT id, nom, type, unite, description FROM variables';
      const params = [];

      if (filters.automate_id) {
        // on lie les variables à un automate via la description
        // format conseillé: `${automateId}|${adresseModbus}`
        sql += ' WHERE description LIKE ?';
        params.push(`${filters.automate_id}|%`);
      }

      const rows = await conn.query(sql, params);
      return rows;
    } finally {
      conn.release();
    }
  },

  async getById(id) {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        'SELECT id, nom, type, unite, description FROM variables WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } finally {
      conn.release();
    }
  },

  async create(data) {
    const conn = await pool.getConnection();
    try {
      const { nom, type, unite, description } = data;

      const res = await conn.query(
        'INSERT INTO variables (nom, type, unite, description) VALUES (?, ?, ?, ?)',
        [nom, type, unite || null, description || null]
      );

      return Number(res.insertId);
    } finally {
      conn.release();
    }
  }
};
