const Automate = require('../models/automate');
exports.getAll = async (req, res, next) => {
  try { res.json(await Automate.getAll()); }
  catch(e){ next(e); }
};
exports.getById = async(req,res,next)=>{
  try { res.json(await Automate.getById(req.params.id)); }
  catch(e){ next(e); }
};
exports.create = async(req,res,next)=>{
  try { res.status(201).json({ id: await Automate.create(req.body) }); }
  catch(e){ next(e); }
};
