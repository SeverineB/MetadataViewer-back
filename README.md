:star: METADATA VIEWER :star:
=============================

### Description

Backend d'une application permettant de visualiser les métadonnées d'une image que l'on a téléchargée, après s'être inscrit et connecté.

### Frameworks & outils utilisés
----------------------------------

* [Node.js](https://nodejs.org/en/)
* [Express](https://expressjs.com/fr/)
* [Dotenv](https://www.npmjs.com/package/dotenv) // Gestion de variables d'environnement
* [Cookie-parser](https://www.npmjs.com/package/cookie-parser) // Lecture des données de cookies
* [Joi](https://www.npmjs.com/package/express-joi-validation) // Validation de données
* [JsonWebToken](https://www.npmjs.com/package/jsonwebtoken) // Gestion de token
* [Mongoose](https://mongoosejs.com/) // Gestion d'une base de données MongoDB
* [Multer](https://www.npmjs.com/package/multer) // Gestion du multipart/form-data (téléchargement de fichiers)
* [Exifr](https://www.npmjs.com/package/exifr) // Lecture des métadonnées
* [Sharp](https://www.npmjs.com/package/sharp) // Redimension et modification d'images

### Base de données
-------------------

Base de données NoSQL créée avec MongoDB (v. 4.4.1)
Pour télécharger MongoDB localement : https://www.mongodb.com/try/download/community

### Installation
----------------

* Cloner le dépôt (nécessite d'avoir Node installé)
* Installation des dépendances
  - yarn
* Lancement du serveur en mode développement
  - nodemon server.js
* Lancer le serveur dans le navigateur
  - http://localhost:3001

### Frontend
-----------

https://github.com/SeverineB/MetadataViewer-front

### Améliorations
-----------------

* Passage en HTTPS (back et front)
