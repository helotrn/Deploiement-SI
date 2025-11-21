// Contrôle API REST pour les variables – /backend/controllers/variablecontroller.js
const Variable = require('../models/variable');
exports.getAll = async (req, res, next) => {
  try { res.json(await Variable.getAll(req.query.automate_id)); }
  catch(e){ next(e); }
};
exports.getById = async(req,res,next)=>{
  try { res.json(await Variable.getById(req.params.id)); }
  catch(e){ next(e); }
};
exports.create = async(req,res,next)=>{
  try { res.status(201).json({ id: await Variable.create(req.body) }); }
  catch(e){ next(e); }
};
