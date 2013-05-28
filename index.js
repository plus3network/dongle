var url = require('url');
var _ = require('lodash');
var request = require('request');
var templates = {};

module.exports = function (options) {

  if (typeof(options) === "string") {
    options = url.parse(options);   
  } else {
    options = _.defaults(options, {
      protocol: 'http',
      port: '80', 
      hostname: 'localhost'
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
      opts.headers = req.headers;
      opts.json = true; // we assume that this a JSON rest endpoint

      // We need to block the content-length because
      // it gums up the works since the content-leght
      // is different after transformation.
      delete opts.headers['content-length'];

      // for PUT and POST request we need to set the requset body
      if (opts.method === 'PUT' || opts.method === 'POST') opts.json = req.body;

      // proxy the requset to the target interface
      request(opts, function (err, resp, body) {
        if (err) return next(err);
        // transform the response and send it.
        res.send(resp.statusCode, transfromOut(resp, body));
      });
    };
  };

};
