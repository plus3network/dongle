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
      var m = cookie.match(/^([^=]+)=.*/);
      return m && name === m[1];
    });

    // if the cookie doesn't exist then go ahead and set it.
    if (!existingCookie) res.set('Set-Cookie', str);
  }
};

module.exports = function (options) {

  if (typeof(options) === "string") {
    options = url.parse(options);   
  } else {
    options = _.defaults(options, {
      protocol: 'http',
      port: '80', 
      hostname: 'localhost',
      forwardHeaders: []
    });
  }

  return function (transformIn, transfromOut, urlTemplate) {
    var template = templates[urlTemplate] || _.template(urlTemplate);

    return function (req, res, next) {
      var locals = {}, opts = {}, urlObject = {};

      // transform the inbound request
      req = transformIn(req); 

      // extend the url object options
      _.extend(urlObject, options, {
        query: req.query,
        pathname: template({ req: req })
      });

      // setup the request object
      opts.url = url.format(urlObject);
      opts.method = req.method;
      opts.headers = _.pick(req.headers, options.forwardHeaders);
      opts.headers.cookie = req.headers.cookie;
      opts.json = true; // we assume that this a JSON rest endpoint
      opts.jar = request.jar();

      // for PUT and POST request we need to set the requset body
      if (opts.method === 'PUT' || opts.method === 'POST') opts.json = req.body;

      // proxy the requset to the target interface
      request(opts, function (err, resp, body) {
        if (err) return next(err);

        // forward the cookies
        opts.jar.cookies.forEach(function (cookie) {
          checkAndSetCookie(res, cookie.str);
        });

        // transform the response and send it.
        res.send(resp.statusCode, transfromOut(resp, body));
      });
    };
  };

};
