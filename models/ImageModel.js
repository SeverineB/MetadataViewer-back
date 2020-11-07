const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// create PictureSchema

const ImageSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
  },
  size: {
    type: Number,
  },
  type: {
    type: String,
  },
  imagePath: {
    type: String,
  },
  thumbnailPath: {
    type: String,
  }
});

module.exports = ImageModel = mongoose.model('Image', ImageSchema)