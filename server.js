process.env.NODE_ENV = process.env.NODE_ENV || 'development';
var mongoose = require('./config/mongoose');
var https = require('https');
var fs = require('fs');
var express = require('./config/express');
var passport = require('./config/passport');
var config = require('./config/config')

var db = mongoose();
var app = express();
var passport = passport();

if (process.env.NODE_ENV === 'development') {
  app.locals.pretty = true;
  var credentials = {
    key: fs.readFileSync('./config/env/key.pem', 'utf8'),
    cert: fs.readFileSync('./config/env/cert.pem', 'utf8'),
    passphrase: config.passphrase
  };
  https.createServer(credentials, app).listen(8443)
} else {
  app.listen(process.env.PORT || 3000);
}

module.exports = app;

console.log('Server running');