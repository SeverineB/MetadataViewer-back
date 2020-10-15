const Joi = require('joi');

const validationSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(4).max(30).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().alphanum().min(5).max(30).required(), 
})

module.exports = {
  validationSchema
}