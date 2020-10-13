const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');
const user = require('../validations/user');


const auth = async (req, res, next) => {
  // check if there is a cookie in request
  if (!req.cookies.token)
    return res.status(401).json('Il n\'y a pas de token !').end();
    try {
      // check if jwt token is the same as user token in db
      const decoded = jwt.verify(req.cookies.token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findOne({ id: jwt.decode.id })
      // check if token in request same as token stored in db for this user
      if (req.cookies.token === user.token) {
        console.log('les tokens correspondent bien');
        req.user = decoded;
        next();
      }
    } catch (error) {
      res.clearCookie('token');
      return res.status(400).json(error.toString());
  }
};

module.exports = auth;
