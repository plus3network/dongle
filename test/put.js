var dongle = require('../');
var should = require('should');
var app = require('./fixtures/app');
var http = require('http');
var server = http.createServer(app);
var request = require('request');
var options = { 
  url: 'http://localhost:6767/v1/simple',
  method: 'PUT',
  json: {
    id: 123,
    first_name: "John",
    last_name: "Doe"
  }
};

describe('put', function () {

  before(function (done) {
    var adapter = dongle({ hostname: "localhost", port: '6767' });

    var input = function (request, callback) {
      request.params.id = request.body.id;
      request.body = {
        _id: request.body.id,
        name: {
          first: request.body.first_name,
          last: request.body.last_name
        }
      };

      callback(null, request);
    };

    var output = function (response, data, callback) {
      callback(null, { 
        id: data._id, 
        first_name: data.name.first, 
        last_name: data.name.last
      });
    };

    app.put('/v1/simple', adapter(input, output, "/v2/simple/<%= req.params.id %>"));

    app.put('/v2/simple/:id', function (req, res, next) {
      res.send(201, req.body);
    });

    server.listen(app.get('port'), done);
  });

  after(function (done) {
    server.close(done);
  });

  it('should return 201', function (done) {
    request(options, function (err, resp, body) {
      resp.statusCode.should.eql(201);
      done();
    });
  });

  it('should transform', function (done) {
    request(options, function (err, resp, body) {
      body.id.should.eql(123);
      body.first_name.should.eql('John');
      body.last_name.should.eql('Doe');
      done();
    });
  });


});
