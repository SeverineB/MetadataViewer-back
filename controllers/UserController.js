const User = require('../models/UserModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { registerSchema, loginSchema } = require('../validations/user');

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
        return res.status(401).send({
          success: false,
          message: 'Les champs doivent tous être renseignés !'})
      }

      // validate with Joi schema
      const result = await registerSchema.validateAsync(req.body);
      const { error } = result;

      if (error) {
        return res.status(400).send({
          success: false,
          message: error.message})
      }

      // check if email doesn't already exist on db
      const alreadyExist = await User.findOne({ email: email });
      if (alreadyExist) {
        return res.status(401).send({
          success: false,
          message: 'Cet email existe déjà !'});
      }

      // if everything is ok create new user
      const newUser = await User.create({
        email: email,
        password: bcrypt.hashSync(password, 10),
        username: username,
      })

      await newUser.save();
      return res.status(200).send({
        success: true,
        message: 'L\'utilisateur a été bien été enregistré !'
      });
    }
    catch (error) {
      console.log(error.message);
      res.status(500).send({
          success: false,
          message: 'Impossible d\'exécuter la requête !'
      })
    }
  },

  //
  // Login a user
  //

  login: async (req, res) => {
  
    try {
      const { email, password } = req.body;
      console.log(' req body', req.body);
      
      // validate with Joi schema
      const result = await loginSchema.validateAsync(req.body);
      const { error } = result;

      if (error) {
        return res.status(400).send({
          success: false,
          message: error.message})
      }

      const user = await User.findOne({ email: email });

      if (!user) {
        return res.status(401).send({
          error: {
            id: 'email',
            message: 'L\'email n\'existe pas !'
          }
        });
      }
        
      // compare the password with the hashed one in db
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).send({
          error: {
            id: 'password',
            message: 'Le mot de passe n\'est pas correct !'
          }
        });
      }

      // create a token
      const token = jwt.sign({
        id: user._id,
        username: user.username
      },
        process.env.TOKEN_SECRET,
        {expiresIn: process.env.TOKEN_EXPIRESIN}
      );

      // store token in user data
      user.token = token;
      await user.save();

      // send the token in a cookie
      return res.cookie('token', token, {
        expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        httpOnly:true,
        secure: true,
        path: '/'
      }).send({
        isLogged: true,
        session: {
          _id: user._id,
          username: user.username,
          }
        });
        

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

    res.status(200).send({message: 'User bien connecté !'});
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
    res.clearCookie('token').send({message: 'user déconnecté'})
  }
};