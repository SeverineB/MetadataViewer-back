const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// create UserSchema

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  token: {
    type: String,
  },
  images: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Image'
    }
  ],
  timeStamps: Date,
})

module.exports = UserModel = mongoose.model('User', UserSchema)