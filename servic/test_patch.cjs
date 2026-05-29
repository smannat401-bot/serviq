const http = require('http');

const data = JSON.stringify({
  name: 'Test',
  phone: '123',
  serviceArea: 'Test Area',
  profilePhoto: ''
});

const req = http.request({
  hostname: 'localhost',
  port: 5000,
  path: '/api/auth/profile/64f1b2b3c4d5e6f7a8b9c0d1', // Fake ID, will get 404 or 500
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
