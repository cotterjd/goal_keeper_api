function middleware(app, done) {
  var bodyParser = require("body-parser");
  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

  app.use(require("cookie-parser")());

  app.use(require("./headers"));

  require("./database")(function() {
    app.emit("dbSynced");
    if (done) {
      done();
    }
  });
  app.use(require("./auth"));
}
module.exports = middleware;
