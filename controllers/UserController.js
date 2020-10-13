const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationSchema } = require('../validations/user');
const user = require('../validations/user');

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
        res.status(401).send({message: 'Les champs doivent tous être renseignés !'})
      }

      // validate with Joi schema

      const result = validationSchema.validate(req.body);
      const { error, value } = result;
      if (error) {
        res.status(401).send({message: error.message})
      }
      else {
        // check if email doesn't already exist on db
       const alreadyExist = await User.findOne({ email: email });
        if (alreadyExist){
          res.status(401).send({message: 'Cet email existe déjà !'});
        } else {
          // if everything is ok create new user
          const newUser = await User.create({
            email: email,
            password: bcrypt.hashSync(password, 10),
            username: username,
            token: null
          })
          await newUser.save();
          res.status(200).send({message: 'L\'utilisateur a été bien été enregistré !'});
        }
      }
    } catch (error) {
      res.status(500).send({
        error: {
          message: 'Impossible d\'exécuter la requête !'
        }
      })
    }
  },

  //
  // Login a user
  //



  login: async (req, res) => {
  
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email: email });

      if (!user) {
        res.status(401).send({
          error: {
            id: 'email',
            message: 'L\'email n\'existe pas !'
          }
        });
      } else {
        
        // compare the password with the hashed one in db
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          res.status(401).send({
            error: {
              id: 'password',
              message: 'Le mot de passe n\'est pas correct !'
            }
          });
        }
          
          // create the token
          const token = jwt.sign({
            id: user._id,
            username: user.username
          },
            process.env.ACCESS_TOKEN_SECRET,
            {expiresIn: 86400}
          );
          
          // stock token in user data
          user.token = token;
          await user.save();
          console.log('USER, user);')

          // create cookie with token
          res.cookie('token', token, {httpOnly:true}).send({
            isLogged: true,
            session: {
              _id: user._id,
              username: user.username,
            }
          });
        }
    } catch (error) {
      res.status(500).send({
        error: {
          message: 'Impossible d\'exécuter la requête !'}
        })
    }
  },

  //
  // Check if user is logged
  //

  userLogged: async (req, res) => {
    console.log('dans userLogged controller req.cookies.token :', req.cookies.token);
    res.status(200).send({
      message: 'User bien connecté !'
    });
  },

  //
  // Deconnect a user
  //

  logout: async (req, res) => {
    console.log('req.token dans logout :', req.cookies.token)
    const user = await User.findOne({ token: req.cookies.token });
    user.token = null;
    await user.save();
    res.clearCookie('token').send();
  }
};