var Joi = require("joi"),
  _ = require("lodash");
function formatErrorIntoMessage(e) {
  return _.reduce(
    e.details,
    function(sum, err, i) {
      return sum + err.message + " ";
    },
    ""
  );
}
module.exports = function joiMiddleware(joiSchema) {
  return function(req, res, next) {
    if (!joiSchema) {
      console.error("No schema passed to joi to validate");
      return next();
    }

    if (joiSchema.permission && !req.user.hasPermission(joiSchema.permission)) {
      return res.status(401).json({ error: "You are not Authorized" });
    }

    Joi.validate(req.body || req.query, joiSchema, function(e) {
      if (e === null) {
        return next();
      }
      return res
        .status(500)
        .json({ success: false, error: formatErrorIntoMessage(e) });
    });
  };
};
