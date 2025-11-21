// Contrôle API REST pour les mesures & lecture temps réel – /backend/controllers/mesurecontroller.js
const Mesure = require('../models/mesure');
const Variable = require('../models/variable');
const Automate = require('../models/automate');
const { readModbusRegister } = require('../services/modbusservice');

exports.getAll = async (req, res, next) => {
  try { res.json(await Mesure.getAll(req.query)); }
  catch(e){ next(e); }
};

// Lecture "live" via réseau automate
exports.lireEnDirect = async (req,res,next)=>{
  try {
    const variable = await Variable.getById(req.params.id);
    const automate = await Automate.getById(variable.automate_id);
    const val = await readModbusRegister(automate.adresse_ip, 502, 1, variable.registre, 1);
    // Optionnel : enregistrer dans la bdd
    await Mesure.add(variable.id, val[0]);
    res.json({ valeur: val[0] });
  } catch(e){ next(e); }
};
