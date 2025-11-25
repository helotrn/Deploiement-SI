// Point d'entrée backend Node.js/Express
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/automates', require('./routes/automateroutes'));
app.use('/api/variables', require('./routes/variableroutes'));
app.use('/api/mesures', require('./routes/mesureroutes'));
app.use('/api/exports', require('./routes/exportroutes'));
app.use((err, req, res, next)=>{
  console.error(err); res.status(500).json({ message: err.message });
});

const PORT = process.env.APP_PORT || 3000;
app.listen(PORT, ()=>console.log('API supervision backend sur port ' + PORT));

const automateRoutes = require('./routes/automateroutes');
app.use('/api/automate', automateRoutes);

