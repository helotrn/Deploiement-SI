// Accès table "mesures" 
const pool = require('../config/database');
module.exports = {
  async getAll({ variable_id, date_debut, date_fin, limit }) {
    const conn = await pool.getConnection();
    try {
      let sql = 'SELECT * FROM mesures WHERE 1';
      const params = [];
      if (variable_id) { sql += ' AND variable_id=?'; params.push(variable_id);}
      if (date_debut) { sql += ' AND horodatage >= ?'; params.push(date_debut);}
      if (date_fin)   { sql += ' AND horodatage <= ?'; params.push(date_fin);}
      sql += ' ORDER BY horodatage DESC';
      if (limit) sql += ' LIMIT ' + parseInt(limit,10);
      return await conn.query(sql, params);
    } finally { conn.release(); }
  },
  async add(variable_id, valeur) {
    const conn = await pool.getConnection();
    try {
      const result = await conn.query(
        'INSERT INTO mesures (variable_id, valeur, horodatage) VALUES (?, ?, NOW())',
        [variable_id, valeur]
      );
      return result.insertId;
    } finally { conn.release(); }
  }
};
