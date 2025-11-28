// Backend/models/mesure.js
const pool = require('../config/database');

module.exports = {
  async getAll() {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query('SELECT * FROM mesures ORDER BY horodatage DESC');
      return rows;
    } finally {
      conn.release();
    }
  },

  async getByAutomate(idAutomate, limit) {
    const conn = await pool.getConnection();
    try {
      const rows = await conn.query(
        'SELECT * FROM mesures WHERE id_automate = ? ORDER BY horodatage DESC LIMIT ?',
        [idAutomate, limit]
      );
      return rows;
    } finally {
      conn.release();
    }
  },

  async create(data) {
    const conn = await pool.getConnection();
    try {
      const {
        id_automate,
        id_variable,
        valeur,
        temperature,
        pression,
        alarme
      } = data;

      const res = await conn.query(
        `INSERT INTO mesures (id_automate, id_variable, valeur, temperature, pression, alarme)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [id_automate, id_variable, valeur, temperature, pression, alarme ? 1 : 0]
      );
      return res.insertId;
    } finally {
      conn.release();
    }
  }
};
