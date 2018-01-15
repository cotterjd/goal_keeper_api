var express = require("express")
,  graphqlHTTP = require("express-graphql")
,  { expressPlayground } = require("graphql-playground-middleware")
,  otter = require("otter-routes")
,  path = require("path")
,  app = express()
;

global.include = file => require(__dirname + "/" + file);
app.get("/status", (req, res) => {
  res.end();
});

require("./middleware")(app, function done() {
  var schema = require("./lib/graphql/schema").Schema;
  app.use(
    "/api/graphql",
    graphqlHTTP({
      schema: schema,
      rootValue: global,
      graphiql: true
    })
  );
  app.use(
    "/playground",
    expressPlayground({
      endpoint: "/api/graphql"
    })
  );
  otter(
    app,
    {
      directory: "routes",
      routerName: "Otter",
      diagnostics: true,
      methods: {
        get: "get",
        list: "get",
        put: "put",
        post: "post",
        delete: "delete"
      },
      fileMatchersForId: ["get", "put", "delete"],
      routeParamMatchers: {}
    },
    function(err, results) {
      app.listen(4051, function() {
        console.log("app listening on port 4051", process.env.NODE_ENV);
        app.emit("appStarted");
      });
    }
  );
});

module.exports = app;
