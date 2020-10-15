const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

const auth = async (req, res, next) => {

  // check if there is a cookie in request

  const token = req.cookies.token;
  if (!token)
    return res.status(401).send('Il n\'y a pas de token');
    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      next();
    }
    catch (error) {
      res.clearCookie('token');
      return res.status(400).send(error.message);
    }
};

module.exports = auth;
