const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// create PictureSchema

const ImageSchema = new Schema({
  imagePath: {
    type: String,
  },
  imageThumbPath: {
    type: String,
  }
});

module.exports = ImageModel = mongoose.model('Image', ImageSchema)