[![Build Status](https://travis-ci.org/plus3network/dongle.png?branch=master)](https://travis-ci.org/plus3network/dongle)

## Information

<table>
<tr> 
<td>Package</td><td>dongle</td>
</tr>
<tr>
<td>Description</td>
<td>A route adapter for Express REST-like interfaces. This library will allow you transform requests to one interface and forward them to another. Once the requst is returned you can transform the results. The primary use case for this module is when you need to support legacy interfaces but you want to have all the business logic in the same place.</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.8</td>
</tr>
</table>

## Usage

```javascript
var express = require('express');
var app = express();
var dongle = require('dongle');
var adapter = dongle({ hostname: "localhost", port: 6767 });

var input = function (request) {
  request.body = {
    name: {
      first: request.body.first_name,
      last: request.body.last_name
    }
  };
};

var output = function (response, data) {
  return {
    first_name: data.name.first_name,
    last_name: data.name.last
  }; 
};

app.put('/v1/user', adapter(input, output, "/v2/user/<%= req.query.id %>"));
app.put('/v2/user/:id', function (req, res, next) {
  // do stuff here with the database and a bunch of business logic
  res.send(201, req.body);
});

```

## LICENSE

(MIT License)

Copyright (c) 2013 Plus 3 Network <dev@plus3network.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
