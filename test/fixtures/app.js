/**
 * Module dependencies.
 */

var express = require('express');
var app = module.exports = express();

// all environments
app.set('port', process.env.PORT || 6767);
app.use(express.favicon());
app.use(express.cookieParser('this-should-be-secure'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' === app.get('env')) {
  app.use(express.errorHandler());
}

