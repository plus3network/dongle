var dongle = require('../');
var should = require('should');
var app = require('./fixtures/app');
var http = require('http');
var server = http.createServer(app);
var request = require('request');
var options = { 
  url: 'http://localhost:6767/v1/test',
  method: 'PUT',
  headers: {
    'x-token': '1234abcd'
  },
  json: {
    id: 123,
    first_name: "John",
    last_name: "Doe"
  }
};

describe('headers', function () {

  beforeEach(function (done) {

    var input = function (request, callback) {
      request.params.id = request.body.id;
      callback(null, request);
    };

    var output = function (response, data, callback) {
      callback(null, data);
    };

    app.put('/v1/test', dongle(input, output, "/v2/test/<%= req.params.id %>"));

    app.put('/v2/test/:id', function (req, res, next) {
      res.send(201, req.headers);
    });

    server.listen(app.get('port'), done);
  });

  afterEach(function (done) {
    server.close(done);
  });

  it('should forward specified headers', function (done) {
    request(options, function (err, resp, body) {
      body['x-token'].should.eql('1234abcd');
      done();
    });
  });


});
