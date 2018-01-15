var config = require("../config")(),
  uuid = require("node-uuid"),
  nodemailer = require("nodemailer"),
Handlebars = require("handlebars");
Handlebars.registerHelper("money", function(n) {
  n = parseFloat(n);
  return (
    "$" +
    n.toFixed(2).replace(/./g, function(c, i, a) {
      return i && c !== "." && (a.length - i) % 3 === 0 ? "," + c : c;
    })
  );
});

//function emailTemplate(obj){
//    var t = Handlebars.compile(obj.template);
//
//    email(obj.to, t(obj.data), obj.subject, obj.cb);
//}

function email(to, message, subject, cb, overrideTest) {
  if (!cb) cb = function() {};
  if (process.env.NODE_ENV == "test") {
    if (!overrideTest) {
      return cb();
    }
    to = "caleb.briggs@gmail.com";
  }
  var ses = {
    AWSAccessKeyID: "",
    AWSSecretKey: "",
    ServiceUrl: "https://email.us-west-2.amazonaws.com",
    mailer: "SES"
  };

  var smtpTransport = nodemailer.createTransport("SES", ses);

  var mailOptions = {
    from: "",
    to: to,
    subject: subject,
    html: message
  };
  smtpTransport.sendMail(mailOptions, function(error) {
    smtpTransport.close();
    cb(error);
  });
}

module.exports = {
  //    text: text,
  email: email
  //    emailTemplate: emailTemplate,
  //   sendMessages: sendMessages
};
