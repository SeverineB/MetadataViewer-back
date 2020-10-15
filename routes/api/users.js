const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../controllers/UserController');

//
// users's routes
//

// get users's list
router.get('/', auth, User.findAll);

// add a user
router.post('/register', User.register);

// connect a user
router.post('/login', User.login);

// deconnect a user
router.get('/logout', auth, User.logout);

// check if user connected
router.post('/isLogged', auth, User.userLogged);

module.exports = router;