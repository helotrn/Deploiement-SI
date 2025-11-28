// Point d'entrée backend Node.js/Express
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Import des routes
const utilisateursRoutes = require('./routes/utilisateursroutes');
const automateRoutes = require('./routes/automateroutes');
const variableRoutes = require('./routes/variableroutes');
const mesureRoutes = require('./routes/mesureroutes');
const exportRoutes = require('./routes/exportroutes');

// Log de la configuration BDD au démarrage
console.log('Config DB :', {
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME
});

app.use(cors());
app.use(express.json());

// Routes API
app.use('/api/automates', automateRoutes);   // une seule fois
app.use('/api/variables', variableRoutes);
app.use('/api/mesures', mesureRoutes);
app.use('/api/exports', exportRoutes);
app.use('/api/utilisateurs', utilisateursRoutes);

// Middleware d'erreur
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, () => {
  console.log('API supervision backend sur port ' + PORT);
});


