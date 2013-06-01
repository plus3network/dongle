var dongle = require('../');
var should = require('should');
var app = require('./fixtures/app');
var http = require('http');
var server = http.createServer(app);
var request = require('request');

describe('get', function () {

  beforeEach(function (done) {

    var transformIn = function (request, callback) {
      request.params.id = 123;
      callback(null, request);
    };

    var transfromOut = function (response, data, callback) {
      data.message = "Okay";
      callback(null, data);
    };

    var url = "/v2/simple/<%= req.params.id %>";

    app.get('/v2/simple/:id', function (req, res, next) {
      res.send(200, { message: "ok", id: req.params.id });
    });

    app.get('/v1/simple', dongle(transformIn, transfromOut, url));
    server.listen(app.get('port'), done);
  });

  afterEach(function (done) {
    server.close(done);
  });

  it('should return 200', function (done) {
    var options = { url: 'http://localhost:6767/v1/simple', json: true };
    request(options, function (err, resp, body) {
      resp.statusCode.should.eql(200);
      done();
    });
  });

  it('should be transform the message', function (done) {
    var options = { url: 'http://localhost:6767/v1/simple', json: true };
    request(options, function (err, resp, body) {
      body.message.should.eql('Okay');
      done();
    });
  });


});
