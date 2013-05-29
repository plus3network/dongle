var dongle = require('../');
var should = require('should');
var app = require('./fixtures/app');
var http = require('http');
var server = http.createServer(app);
var request = require('request');
var cookieSignature = require('cookie-signature');
var _ = require('lodash');

var jar = request.jar();
var cookie = request.cookie('foo=bar');
var signedCookie = request.cookie('bar=s:'+cookieSignature.sign('foo', 'this-should-be-secure'));
jar.add(cookie);
jar.add(signedCookie);

var options = { 
  url: 'http://localhost:6767/v1/cookies',
  method: 'PUT',
  jar: jar,
  json: {
    id: 123,
    first_name: "John",
    last_name: "Doe"
  }
};

describe('headers', function () {

  before(function (done) {

    var adapter = dongle({ 
      hostname: "localhost", 
      port: '6767'
    });

    var input = function (request) {
      request.params.id = request.body.id;
      return request;
    };

    var output = function (response, data) {
      return data;
    };

    var clobberCookieMiddleware = function (req, res, next) {
      res.cookie('clobber', 'no');
      next();
    };

    app.put('/v1/cookies', clobberCookieMiddleware, adapter(input, output, "/v2/cookies/<%= req.params.id %>"));

    app.put('/v2/cookies/:id', function (req, res, next) {
      res.cookie('clobber', 'yes');
      res.cookie('regular', 'test');
      res.cookie('signed', 'test', { signed: true  });
      res.send(201, { cookies: req.cookies, signedCookies: req.signedCookies });
    });

    server.listen(app.get('port'), done);
  });

  after(function (done) {
    server.close(done);
  });

  it('should forward regular cookies from the request', function (done) {
    request(options, function (err, resp, body) {
      body.cookies.foo.should.eql('bar');
      done();
    });
  });
  
  it('should forward signed cookies from the request', function (done) {
    request(options, function (err, resp, body) {
      body.signedCookies.bar.should.eql('foo');
      done();
    });
  });
  
  it('should forward regular cookies from the response', function (done) {
    request(options, function (err, resp, body) {
      var cookie = _.find(options.jar.cookies, function (cookie) {
        return cookie.name === 'regular';
      });      
      should.exist(cookie);
      done();
    });
  });
  
  it('should forward signed cookies from the response', function (done) {
    request(options, function (err, resp, body) {
      var cookie = _.find(options.jar.cookies, function (cookie) {
        return cookie.name === 'signed';
      });      
      should.exist(cookie);
      done();
    });
  });

  it('should not clobber cookies', function (done) {
    request(options, function (err, resp, body) {
      var cookie = _.find(options.jar.cookies, function (cookie) {
        return cookie.name === 'clobber';
      });      
      should.exist(cookie);
      cookie.value.should.eql('no');
      done();
    });
  });


});
