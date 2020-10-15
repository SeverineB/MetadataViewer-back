const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
require('dotenv').config();
const multer = require('multer');

// import routes
const images = require('./routes/api/images');
const users = require('./routes/api/users');

// create express app
const app = express();

// bodyparser middleware
app.use(bodyParser.json());

// configure cors
const corsOptions = {
  origin: ['http://localhost:8080'],
  allowedHeaders: [
    'Accept',
    'Content-Type',
    'Authorization',
    'Access-Control-Allow-Methods',
    'Access-Control-Request-Headers',
  ],
  credentials: true,
  enablePreflight: true,
};

app.use(cors(corsOptions));

// cookieParser middleware
app.use(cookieParser());

// routes
app.use('/images', express.static(__dirname + '/images'));
app.use('/api/images', images);
app.use('/api/users', users); 

//
// MONGO DB
//

// connect to Mongo
connect = mongoose.connect(process.env.MONGO_URI, 
  { useNewUrlParser: true,
  useUnifiedTopology: true })
  // if connection is ok
  .then(() => console.log('Connection with database succeed !'))
  // if there is an error
  .catch(err => console.log(err));

/* const port = process.env.PORT || 3001; */
/* const HOST = 'localhost'; */

app.listen(process.env.PORT, process.env.HOST, () => console.log(`Serveur lancé sur le port ${process.env.PORT}`));