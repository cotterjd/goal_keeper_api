exports = module.exports = function SetHeaderMiddleware(req, res, next) {
  // Blacklist or whitelist any origins you want here, but can't use *
  // but echo the one that came in is ok

  var allow = req.headers.origin ? req.headers.origin : "*";
  var allowedOrigins = [
    "http://localhost:4051",
    "http://localhost:8001"
  ];
  if (allowedOrigins.indexOf(allow) > -1) {
    res.setHeader("Access-Control-Allow-Origin", allow);
  }
  res.setHeader("Access-Control-Allow-Credentials", true); //required ot read cookie token
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With, Content-Type, foobartoken"
  ); // X-Requested-With is only temporary
  res.setHeader("Access-Control-Allow-Methods", "PUT,POST, DELETE");

  if (req.method === "OPTIONS") {
    return res.end("");
  }

  next();
};
