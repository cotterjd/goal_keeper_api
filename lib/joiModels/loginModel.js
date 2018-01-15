var Joi = require("joi");
module.exports = Joi.object()
  .keys({
    password: Joi.string().required(),
    email: Joi.string().required(),
  });
