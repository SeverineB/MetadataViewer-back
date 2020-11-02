const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
require('custom-env').env('local');

// import routes

const images = require('./routes/api/images');
const users = require('./routes/api/users');

// create express app

const app = express();

// bodyparser middleware

app.use(bodyParser.json());

// configure cors
/* 
const corsOptions = {
  origin: ['http://metadata-viewer.severinebianchi.com'],
  allowedHeaders: [
    'Accept',
    'Content-Type',
    'Origin',
    'Authorization',
    'Access-Control-Allow-Methods',
    'Access-Control-Allow-Origin',
    'Access-Control-Request-Headers',
  ],
  credentials: true,
  enablePreflight: true,
};

app.use(cors(corsOptions)); */

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'local' ? 'http://localhost:8080' : 'http://metadata-viewer.severinebianchi.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
})

console.log(process.env.NODE_ENV);

// cookieParser middleware

app.use(cookieParser());

// routes

app.use('/images', express.static(__dirname + '/images'));
app.use('/api/images', images);
app.use('/api/users', users);

// HOME PAGE NODE SERVER
app.get('/', (req, res) => {
  res.send(`
    <div style="margin: 5em auto; width: 400px; line-height: 1.5">
      <h1 style="text-align: center">Hello!</h1>
      <p>Si tu vois ce message, c'est que ton serveur est bien lancé !</p>
      <div>Désormais, tu dois venir utiliser l'API</div>
    </div>
  `);
});

// errors handling middleware

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send({message: 'Une erreur est survenue !'});
})

//
// MONGO DB
//

// connect to Mongo

connect = mongoose.connect(process.env.MONGO_URI,
  { useNewUrlParser: true,
  useUnifiedTopology: true })
  // if connection is ok
  .then(() => console.log('Connection with MongoDB atlas succeed !'))
  // if there is an error
  .catch(err => console.log(err));
  
app.listen(process.env.PORT, process.env.HOST, () => console.log(`Serveur lancé sur le port ${process.env.PORT}`));