var passport = require("passport"),
  session = require("express-session"),
  jwt = require("jwt-simple"),
  Joi = require("joi"),
  uuid = require("node-uuid"),
  strategy = {};

strategy.facebookStrategy = require("passport-facebook").Strategy;
strategy.googleStrategy = require("passport-google-oauth").OAuth2Strategy;

var oauths = ["facebook", "google"];
var baseUrls = {
  facebook: "https://www.facebook.com/app_scoped_user_id/",
  twitter: "https://twitter.com/intent/user?user_id="
};
(_ = require("lodash")), (config = require("../config"));

function formatErrorIntoMessage(e) {
  return _.reduce(
    e.details,
    function(sum, err, i) {
      return sum + err.message + " ";
    },
    ""
  );
}

function lookUpUser(user, type, cb) {
  var name = user.displayName ? user.displayName.split(" ") : [];
  var emails = user.emails || [];
  var newUser = {
    firstname: name[0],
    lastname: name[1],
    email: emails[0] ? emails[0].value : "",
    image: user.photos ? user.photos[0].value : "",
    description: user._json
      ? user._json.bio || user._json.description || user._json.summary
      : ""
  };
  function getSocialUrl(user) {
    return (
      user.profileUrl ||
      (user._json ? user._json.publicProfileUrl || user._json.url : "") ||
      (baseUrls[type] ? baseUrls[type] + user.id : null)
    );
  }
  newUser[type + "Id"] = user.id;
  newUser[type + "Url"] = getSocialUrl(user);
  newUser[type] = user._json;
  var where = {};
  where[type + "Id"] = user.id;

  Joi.validate(newUser, require("../lib/joiModels/userModel"), function(e) {
    if (e !== null) {
      return cb(formatErrorIntoMessage(e));
    }
    sequelize.models.user
      .findOne({
        where: where
      })
      .then(function(u) {
        if (!u) {
          var plainUser;
          return sequelize.models.user
            .create(newUser)
            .then(function(nu) {
              plainUser = nu.get({
                plain: true
              });
              return sequelize.models.role.findOne({
                where: { isDefault: true }
              });
            })
            .then(role => {
              return role.setUsers([plainUser.id]);
            })
            .then(() => {
              cb(null, plainUser);
            });
        } else {
          cb(
            null,
            u.get({
              plain: true
            })
          );
        }
      })
      .catch(cb);
  });
}

function handleStrategy(type) {
  return function(token, tokenSecret, profile, cb) {
    lookUpUser(profile, type, cb);
  };
}

function createLoginAndRedirect(user, res) {
  var login = {
    userId: user.id
  };

  sequelize.models.login.create(login).then(l => {
    if (!l) {
      return res.status(401).json({
        success: false
      });
    }
    var token = l.get({
      plain: true
    }).id;
    return res
      .cookie("foobartoken", token)
      .redirect(config.clientUrl + "/login/success?foobartoken=" + token);
  });
}

function successCB(req, res) {
  //wherever success should go
  var user = req.session.passport.user;
  var token = req.headers.foobartoken || req.cookies.foobartoken;
  function isGuid(s) {
    return s && typeof s == "string" && s.length == 36;
  }
  if (!isGuid(token)) {
    token = null;
  }
  if (token) {
    sequelize.models.login
      .findOne({
        where: {
          id: token
        },
        include: [
          {
            model: sequelize.models.user
          }
        ]
      })
      .then(function(u) {
        if (!u) {
          return res.cookie("foobartoken", null).status(401).json({
            success: false
          });
        } else {
          var oldUserId = user.id;
          var dbUser = u.get({
            plain: true
          }).user;

          if (dbUser.id !== user.id) {
            function assign(src, update) {
              var srcKeys = Object.keys(src);
              var upKeys = Object.keys(update);
              _.each(srcKeys, k => {
                src[k] = src[k] || update[k];
              });
              _.chain(upKeys)
                .filter(k => {
                  return !_.find(srcKeys, sk => {
                    sk == k;
                  });
                })
                .each(uk => {
                  src[uk] = update[uk];
                });
            }
            assign(dbUser, user);

            sequelize.models.user
              .update(dbUser, {
                where: {
                  id: dbUser.id
                }
              })
              .then(() => {
                sequelize.models.user
                  .destroy({
                    where: {
                      id: oldUserId
                    }
                  })
                  .then(() => {
                    return createLoginAndRedirect(dbUser, res);
                  });
              });
          } else {
            return createLoginAndRedirect(dbUser, res);
          }
        }
      });
  } else {
    return createLoginAndRedirect(user, res);
  }
}

function getStrategy(t) {
  var s = strategy[t + "Strategy"];
  var obj = {
    consumerKey: config[t + "Id"],
    consumerSecret: config[t + "Secret"],
    clientID: config[t + "Id"],
    clientSecret: config[t + "Secret"],
    callbackURL: config.url + "/auth/" + t + "/callback",
    returnURL: config.url + "/auth/" + t + "/callback",
    realm: config.url + "/"
  };
  if (t == "linkedin") {
    obj.profileFields = [
      "id",
      "first-name",
      "last-name",
      "email-address",
      "public-profile-url",
      "summary"
    ];
  }
  return new s(obj, handleStrategy(t));
}

function passportAuthentication(app) {
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });
  _.each(oauths, function(t) {
    passport.use(getStrategy(t));
  });

  app.use(
    session({
      resave: false,
      saveUninitialized: false,
      secret: "secret"
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  _.each(oauths, function(t) {
    var scope;
    if (t == "google") {
      scope = {
        scope: ["https://www.googleapis.com/auth/userinfo.email"]
      };
    } else if (t == "linkedin") {
      scope = {
        scope: ["r_basicprofile", "r_emailaddress"]
      };
    }
    app.get("/auth/" + t, passport.authenticate(t, scope));
    app.get(
      "/auth/" + t + "/callback",
      passport.authenticate(t, {
        failureRedirect: "/login"
      }),
      successCB
    );
  });
}

module.exports = passportAuthentication;
