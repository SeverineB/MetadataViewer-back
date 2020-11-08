const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
require('dotenv-flow').config();

// import routes

const images = require('./routes/api/images');
const users = require('./routes/api/users');

// create express app

const app = express();

// bodyparser middleware

app.use(bodyParser.json());

// limit body payload
app.use(express.json({ limit: '10kb'}));

// Data sanitization
app.use(xss());

const limit = rateLimit({
  max: 100,
  windowsMs: 60 * 60 * 1000,
  message: 'Trop de requêtes simultanées !'
});
app.use('/', limit);

// Mongo data mongoSanitize
app.use(mongoSanitize());

// configure headers

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'http://metadata-viewer.severinebianchi.com');
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  next();
})

// cookieParser middleware

app.use(cookieParser());

// routes

app.use('/images', express.static(__dirname + '/images'));
app.use('/api/images', images);
app.use('/api/users', users);

// home page node server
app.get('/', (req, res) => {
  res.send(`
    <div style="margin: 5em auto; width: 600px; line-height: 1.5; font-family: Montserrat">
      <h1>THE METADATA VIEWER SERVER</h1>
      <p>Ce petit serveur est bien lancé, il a ouvert ses ailes et vole maintenant haut vers les nuages !</p>
      <p style="font-size: 12px">Comme personne ne lira ça, j'en profite pour y ajouter une petite citation qu'il est toujours bon de méditer...</p>
      <p style="font-style: italic; font-size: 12px">"Vous savez, moi je ne crois pas qu’il y ait de bonne ou de mauvaise situation. Moi, si je devais résumer ma vie aujourd’hui avec vous, je dirais que c’est d’abord des rencontres. Des gens qui m’ont tendu la main, peut-être à un moment où je ne pouvais pas, où j’étais seul chez moi. Et c’est assez curieux de se dire que les hasards, les rencontres forgent une destinée… Parce que quand on a le goût de la chose, quand on a le goût de la chose bien faite, le beau geste, parfois on ne trouve pas l’interlocuteur en face je dirais, le miroir qui vous aide à avancer. Alors ça n’est pas mon cas, comme je disais là, puisque moi au contraire, j’ai pu : et je dis merci à la vie, je lui dis merci, je chante la vie, je danse la vie… je ne suis qu’amour ! Et finalement, quand beaucoup de gens aujourd’hui me disent « Mais comment fais-tu pour avoir cette humanité ? », et bien je leur réponds très simplement, je leur dis que c’est ce goût de l’amour ce goût donc qui m’a poussé aujourd’hui à entreprendre une construction mécanique, mais demain qui sait ? Peut-être simplement à me mettre au service de la communauté, à faire le don, le don de soi…"</p>
      <p style="font-size: 10px; font-weight: bold; text-align: right">Astérix et Obélix : mission Cléopâtre, Panoramix et Otis</p>
      <p style="text-align: center">Développé par Séverine Bianchi</p>
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
  useUnifiedTopology: true,
  useFindAndModify: false})
  // if connection is ok
  .then(() => console.log('Connection with MongoDB ATLAS succeed !'))
  // if there is an error
  .catch(err => console.log(err));
  
app.listen(process.env.PORT, process.env.HOST, () => console.log(`Serveur lancé sur le port ${process.env.PORT}`));