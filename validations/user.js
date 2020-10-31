const Joi = require('joi');

const registerSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(4).max(30).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/)
})

const loginSchema = Joi.object().keys({
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/)
})

module.exports = {
  registerSchema,
  loginSchema
}