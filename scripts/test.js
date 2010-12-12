var http = require('http');
var google = http.createClient(80, 'zh.wikipedia.org');
var request = google.request('GET', '/w/api.php?page=Wikipedia%3A%E9%A6%96%E9%A1%B5&props=text&action=parse&variant=wiki&format=json',
  {
      'host': 'zh.wikipedia.org',
      'User-Agent': 'Tester'
  });
request.end();
request.on('response', function (response) {
  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));
  response.setEncoding('utf8');
  response.on('data', function (chunk) {
    console.log('BODY: ' + chunk);
  });
});
