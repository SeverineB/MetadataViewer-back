const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const exifr = require('exifr');
const loginSchema = require('../validations/user');
const registerSchema = require('../validations/user');

module.exports = {

  //
  // Get all users

  findAll: async (req, res) => {
    try {
      const users = await User.find({})
      res.send(users)
    } catch (error) {
      res.status(500).send()
    }
  },

  //
  // Create new user
  //

  register: async (req, res) => {
    try {

      // destructuring request body
      const { username, email, password } = req.body;

      if (!email || !password || !username) {
        return res.status(400).send({
          message: 'Les champs doivent tous être renseignés !'})
      }

      // TODO : check how Joi validation isn't working on prod env

      // validate with Joi schema
      /* const result = await registerSchema.validateAsync(req.body);
      const { error } = result;

      if (error) {
        console.log('joi error', error);
        return res.status(404).send({
          message: error.message})
      } */

      // check if email doesn't already exist on db
      const alreadyExist = await User.findOne({ email: email });
      if (alreadyExist) {
        return res.status(401).send({
          message: 'Cet email existe déjà'
        });
      }

      // if everything is ok create new user
      const newUser = await User.create({
        email: email,
        password: bcrypt.hashSync(password, 10),
        username: username,
      })

      await newUser.save();
      return res.status(200).send({
        message: 'L\'utilisateur a été bien été enregistré !'
      });
    }
    catch (error) {
      console.log('error dans catch', error.message);
      res.status(500).send({
          message: 'Impossible de créer le compte',
          error,
      })
    }
  },

  //
  // Login a user
  //

  login: async (req, res) => {
  
    try {
      const { email, password } = req.body;

      // TODO : check how Joi validation isn't working on prod env

      // validate with Joi schema
      /* const result = await loginSchema.validateAsync(req.body);
      const { error } = result;

      if (error) {
        return res.status(400).send({
          message: error.message})
      } */

      const user = await User.findOne({ email: email });
      if (!user) {
        return res.status(404).send({
          message: 'Cet email n\'existe pas !'
        });
      }
        
      // compare the password with the hashed one in db
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({
          message: 'Le mot de passe n\'est pas correct !'
        });
      }

      // create a token
      const token = jwt.sign({
        id: user._id,
        username: user.username
      },
        process.env.PRIVATE_KEY,
        {expiresIn: process.env.TOKEN_EXPIRESIN}
      );

      // store token in user data
      user.token = token;
      await user.save();

      // send the token in a cookie
      return res.cookie('token', token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly:true,
        path: '/'
      }).send({
        isLogged: true,
        session: {
          _id: user._id,
          username: user.username,
          }
        });  
    } catch (error) {
      console.log(error);
      res.status(500).send({
          message: 'Impossible d\'exécuter la requête !'
        })
    }
  },

  //
  // Check if user is logged
  //

   userLogged: async (req, res) => {
    console.log('dans userLogged controller req.cookies.token :', req.cookies.token);

    res.status(200).send({
      message: 'Utilisateur bien connecté !'});
  },

  //
  // Get all image sof the user
  //

  findImagesOfUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findById(id).populate('images');

      const userImages = await Promise.all(user.images.map(async (image) => {

        // Read and store metadata
        const exifMetadata = await exifr.parse(image.imagePath);

        // modify imagePath stored in db for each document to construct the real url
        // and specify the url in prod or dev environment
        const imageName = image.imagePath.replace('./', '');

        if (process.env.NODE_ENV === 'development') {
          const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}:${process.env.PORT}/${image.thumbnailPath}`;
        } else if (process.env.NODE_ENV === 'production') {
          console.log('imageName', imageName)
          const imageUrl = `${process.env.PROTOCOL}://${process.env.HOST}/${imageName}`;
        }

        const id = image._id;
        const { name, size, type } = image;

        // Send exifMetadata only if available
        if (!exifMetadata)
          return {image, metadata: {name, size, type}};
        else
          return {image, metadata: {name, size, type}, exifMetadata};
      }))

      // send data in response
      res.send(userImages);

    }
    catch (error) {
      return res.status(500).send({
        message: 'Impossible de récupérer les images'
      });
    }
  },

  //
  // Deconnect a user
  //

  logout: async (req, res) => {
    // delete the token stored in db
    const user = await User.findOne({token: req.cookies.token});
    user.token = null;
    await user.save();

    // clear cookie in browser
    res.clearCookie('token').send({
      message: 'Utilisateur déconnecté'
    })
  }
};