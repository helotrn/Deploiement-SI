const Automate = require('../models/automate');

exports.getAll = async (req, res, next) => {
  try {
    res.json(await Automate.getAll());
  } catch(e) {
    next(e);
  }
};

exports.getById = async(req,res,next)=>{
  try {
    res.json(await Automate.getById(req.params.id));
  } catch(e) {
    next(e);
  }
};

exports.create = async(req,res,next)=>{
  try {
    const { nom, adresse_ip, emplacement, operateur } = req.body;
    if(!nom || !adresse_ip || !operateur) {
      return res.status(400).json({error: "Champs obligatoires manquants"});
    }
    const id = await Automate.create({ nom, adresse_ip, emplacement, operateur });
    res.status(201).json({ id });
  } catch(e) {
    console.error("Erreur backend : ", e.message);
    res.status(500).json({error: "Erreur backend : " + e.message});
  }
};
