var dongle = require('../');
var assert = require('assert');

describe('dongle', function () {

  it("should return a function", function () {
    var adapter = dongle();
    assert.ok(typeof(adapter) === 'function', 'should be a function');
  });

});
