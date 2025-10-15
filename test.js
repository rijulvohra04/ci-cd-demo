const http = require('http');

const options = {
  host: process.env.HOST || 'localhost',
  port: process.env.PORT || 3000,
  path: '/'
};

const req = http.get(options, (res) => {
  if (res.statusCode === 200) {
    console.log('OK');
    process.exit(0);
  } else {
    console.error('Bad status', res.statusCode);
    process.exit(2);
  }
});

req.on('error', (e) => {
  console.error('Request failed', e.message);
  process.exit(2);
});
