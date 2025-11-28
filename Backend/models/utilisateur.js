const pool = require('../config/database');

module.exports = {
  async getAll() {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query('SELECT * FROM utilisateurs');
      return rows;
    } finally {
      conn.release();
    }
  },

  async getById(id) {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM utilisateurs WHERE id = ?',
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
      const { nom, email, role } = data;
      const res = await conn.query(
        'INSERT INTO utilisateurs (nom, email, role) VALUES (?, ?, ?)',
        [nom, email || null, role || null]
      );
      return res.insertId;
    } finally {
      conn.release();
    }
  }
};
