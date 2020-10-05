const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const config = require('config');

// create express app
const app = express();

// manage cors
app.use(cors);

// database config
const db = config.get('mongoURI');

// connect to Mongo
mongoose.connect(db, 
  { useNewUrlParser: true,
  useUnifiedTopology: true })
  // if connection is ok
  .then(() => console.log('Connection with database succeed !'))
  // if there is an error
  .catch(err => console.log(err));

const port = process.env.PORT || 3001;
const HOST = 'localhost';

app.listen(port, HOST, () => console.log(`Serveur lancé sur le port ${port}`));