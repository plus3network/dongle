var url = require('url');
var _ = require('lodash');
var request = require('request');
var templates = {};


var checkAndSetCookie = function (res, str) {
  // get all the set-cookie strings
  var sets = res.get('Set-Cookie');

  // we need to ensure that the sets value is an array
  // if it's not we need to make it an aray
  if (!_.isArray(sets)) sets = [sets];

  // parse out the name of the cookie we are settings
  var matches = str.match(/^([^=]+)=.*/);
  if (matches) {
    var name = matches[1];

    // see if the cookie already exists
    var existingCookie = _.find(sets, function (cookie) {
      if (!cookie) return false;
      var m = cookie.match(/^([^=]+)=.*/);
      return m && name === m[1];
    });

    // if the cookie doesn't exist then go ahead and set it.
    if (!existingCookie) res.set('Set-Cookie', str);
  }
};

module.exports = function (transformIn, transformOut, urlTemplate) {
  var template = templates[urlTemplate] || _.template(urlTemplate);

  return function (req, res, next) {
    var locals = {}, opts = {}, urlObject = {};

    // transform the inbound request
    transformIn(req, function (err, req) {
      if (err) return next(err);

      var oldSend = res.send;
      res.send = function (body) {
        // Taken form Express resposne module
        // allow status / body
        if (2 == arguments.length) {
          // res.send(body, status) backwards compat
          if ('number' != typeof body && 'number' == typeof arguments[1]) {
            this.statusCode = arguments[1];
          } else {
            this.statusCode = body;
            body = arguments[1];
          }
        }

        transformOut(res, body, function (err, data) {
          res.send = oldSend;
          res.send.call(res, data);
        });

      };
      req.url = template({ req: req });
      req.originalUrl = req.url;
      req.app.handle(req, res);
      return;
    }); 
  };
};
