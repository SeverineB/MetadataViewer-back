const express = require('express');
const router = express.Router();
const multer = require('../../middleware/multer');
const auth = require('../../middleware/auth');

const Image = require('../../controllers/ImageController');

//
// pictures's routes
//

// get all the pictures
router.get('/', Image.findAll);

// upload a picture
router.post('/upload/:userId', auth,  multer, Image.add);

// delete a picture
router.delete('/delete/:id/:imageId', auth,  Image.findByIdAndDelete);

module.exports = router;
