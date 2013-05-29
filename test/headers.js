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

  before(function (done) {

    var adapter = dongle({ 
      hostname: "localhost", 
      port: '6767', 
      forwardHeaders: ['x-token']
    });

    var input = function (request) {
      request.params.id = request.body.id;
      return request;
    };

    var output = function (response, data) {
      return data;
    };

    app.put('/v1/test', adapter(input, output, "/v2/test/<%= req.params.id %>"));

    app.put('/v2/test/:id', function (req, res, next) {
      res.send(201, req.headers);
    });

    server.listen(app.get('port'), done);
  });

  after(function (done) {
    server.close(done);
  });

  it('should forward specified headers', function (done) {
    request(options, function (err, resp, body) {
      body['x-token'].should.eql('1234abcd');
      done();
    });
  });


});
