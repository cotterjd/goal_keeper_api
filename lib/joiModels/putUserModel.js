var Joi = require("joi")
, base = require("./userModel")
;

module.exports = base.keys({
  id: Joi.string().guid().required()
});
