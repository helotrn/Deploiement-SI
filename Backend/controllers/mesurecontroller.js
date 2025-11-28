// Backend/controllers/mesurecontroller.js
const Mesure = require('../models/mesure');
const ModbusService = require('../services/modbusservice');
const pool = require('../config/database');

module.exports = {
  // GET /api/mesures  (toutes ou filtrées)
  async getAllOrByAutomate(req, res) {
    try {
      const automateId = req.query.automateId;
      const limit = parseInt(req.query.limit || '50', 10);
      const from = req.query.from;
      const to = req.query.to;

      // Si on veut des filtres plus avancés (historique)
      let sql = 'SELECT * FROM mesures WHERE 1=1';
      const params = [];

      if (automateId) {
        sql += ' AND id_automate = ?';
        params.push(automateId);
      }
      if (from) {
        sql += ' AND horodatage >= ?';
        params.push(from);
      }
      if (to) {
        sql += ' AND horodatage <= ?';
        params.push(to);
      }

      sql += ' ORDER BY horodatage DESC';

      // Si pas de filtre de dates, on limite le nombre de lignes
      if (!from && !to) {
        sql += ' LIMIT ?';
        params.push(limit);
      }

      const conn = await pool.getConnection();
      try {
        const rows = await conn.query(sql, params);
        conn.release();
        return res.json(rows);
      } catch (err) {
        conn.release();
        throw err;
      }
    } catch (err) {
      console.error('Erreur getAllOrByAutomate mesures:', err);
      res.status(500).json({ message: 'Erreur serveur mesures' });
    }
  },

  // POST /api/mesures
  async create(req, res) {
    try {
      const id = await Mesure.create(req.body);
      res.status(201).json({ id });
    } catch (err) {
      console.error('Erreur create mesure:', err);
      res.status(500).json({ message: 'Erreur serveur mesures' });
    }
  },

  // GET /api/mesures/ping?ip=...
  async pingAutomate(req, res) {
    const ip = req.query.ip;
    if (!ip) {
      return res.status(400).json({ online: false, message: 'ip requise' });
    }

    try {
      const online = await ModbusService.ping(ip);
      res.json({ online: !!online });
    } catch (err) {
      console.error('Erreur ping automate:', err);
      res.json({ online: false });
    }
  },

  // GET /api/mesures/live?ip=...
  async liveMeasures(req, res) {
    const ip = req.query.ip;
    if (!ip) {
      return res.status(400).json({ message: 'ip requise' });
    }

    try {
      // À adapter avec les VRAIES adresses de registres de ton automate
      const tempData = await ModbusService.readModbusRegister(ip, 100, 1);
      const pressData = await ModbusService.readModbusRegister(ip, 110, 1);

      res.json({
        temperature: tempData[0],
        pression: pressData[0]
      });
    } catch (err) {
      console.error('Erreur liveMeasures:', err);
      res.status(500).json({ message: 'Erreur lecture automate' });
    }
  }
};
