// Export CSV mesures 
const router = require('express').Router();
const pool = require('../config/database');
const { Parser } = require('json2csv');

router.get('/mesures', async (req, res) => {
  const { variable_id, date_debut, date_fin } = req.query;
  let sql = 'SELECT * FROM mesures WHERE 1=1';
  const params = [];
  if (variable_id) { sql += ' AND variable_id=?'; params.push(variable_id);}
  if (date_debut) { sql += ' AND horodatage >= ?'; params.push(date_debut);}
  if (date_fin) { sql += ' AND horodatage <= ?'; params.push(date_fin);}
  sql += ' ORDER BY horodatage DESC LIMIT 10000'; // anti-abus
  const conn = await pool.getConnection();
  const data = await conn.query(sql, params);
  conn.release();
  const parser = new Parser();
  const csv = parser.parse(data);
  res.setHeader('Content-Disposition', 'attachment; filename=export.csv');
  res.set('Content-Type', 'text/csv');
  res.status(200).send(csv);
});
module.exports = router;
