//var moment = require("moment");
const _ = require("lodash");

module.exports = function(req, res, next) {
  var token = req.headers.foobartoken || req.cookies.foobartoken;

  function isGuid(s) {
    return s && typeof s == "string" && s.length == 36;
  }

  if (!isGuid(token)) {
    token = null;
  }

  function shouldReturnNext() {
    return (
      req.originalUrl.indexOf("/api") == -1 ||
      req.originalUrl.indexOf("/api/logout") != -1 ||
      req.originalUrl.indexOf("/api/graphql") != -1 ||
      req.originalUrl.indexOf("/api/password/reset") != -1 ||
      (req.originalUrl.indexOf("/api/password") != -1 &&
        req.originalUrl.indexOf("/api/password/reset") == -1) ||
      (req.originalUrl.indexOf("/api/login") != -1 && !token) ||
      (req.body.query && req.body.query.indexOf("login") != -1)
    );
  }

  if (shouldReturnNext()) {
    if (!token) {
      return next();
    }
  }

  if (!token) {
    return res
      .cookie("foobartoken", null)
      .status(401)
      .json({ success: false, error: "no token" });
  }

  res.cookie("foobartoken", token);

  try {
    var userById = {
      where: {
        id: token
      },
      include: [
        {
          model: sequelize.models.user,
        }
      ]
    };

    function attachUserToRequest(u) {
      if (!u) {
        //there is no user.
        return res
          .cookie("foobartoken", "")
          .status(401)
          .json({ success: false, error: "no user" });
      } else {
        var _user = u.get({ plain: true }).user;
        if (!_user) {
          //there is no user.
          return res
            .cookie("foobartoken", "")
            .status(401)
            .json({ success: false, error: "no user" });
        }

        req.user = _user;
        next();
      }
    }

    sequelize.models.login.findOne(userById).then(attachUserToRequest);
  } catch (e) {
    console.error(e);

    return res
      .cookie("foobartoken", "")
      .status(401)
      .json({ success: false, error: e });
  }
};
