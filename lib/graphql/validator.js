import joi from "joi";
import _ from "lodash";
function formatErrorIntoMessage(e) {
  return _.reduce(
    e.details,
    function(sum, err, i) {
      return sum + err.message + " ";
    },
    ""
  );
}
let joiValidate = options => {
  let { joiModel, permission, user, obj } = options;
  return new Promise((resolve, reject) => {
    if (permission && (!user || !user.hasPermission(permission))) {
      return reject("You are not authorized");
    }
    if (!joiModel) return resolve();
    joi.validate(obj, joiModel, error => {
      if (error) {
        console.log(error);
        return reject(formatErrorIntoMessage(error));
      }
      return resolve();
    });
  });
};

export { joiValidate };
