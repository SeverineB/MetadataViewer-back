const Joi = require('joi');

// define the validation rules for email password and username
/* const authSchema = {Joi.object().keys({
  email: Joi.string().email().lowercase().required(),
  username: Joi.string().alphanum().min(4).max(30).required(),
  password: Joi.string().pattern(new RegExp('^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,20}$'))
})
}; */

const validationSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(4).max(30).required(),
  email: Joi.string().email().lowercase().required(),
  /* password: Joi.string().pattern(new RegExp('^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{5,20}$')).required(), */
  password: Joi.string().alphanum().min(5).max(30).required(), 
})

module.exports = {
  validationSchema
}