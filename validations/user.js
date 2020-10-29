const Joi = require('joi');

const authSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(4).max(30).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(5).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{5,}$/)
})

const tokenSchema = Joi.object().keys({
  token: Joi.string().alphanum().required(),
})

module.exports = {
  authSchema,
  tokenSchema
}