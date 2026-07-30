const http = require('http');
const loginData = JSON.stringify({ email: 'admin@example.com', password: 'securepassword123' });

const loginReq = http.request({
  hostname: 'localhost', port: 5000,
  path: '/api/auth/login', method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(loginData) }
}, (res) => {
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      const token = parsed?.data?.accessToken;
      console.log('Login status:', res.statusCode);
      if (!token) { console.error('No token. Response:', body); return; }

      // Step 2: hit /api/complaints
      const req2 = http.request({
        hostname: 'localhost', port: 5000,
        path: '/api/complaints', method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      }, (res2) => {
        let b2 = '';
        res2.on('data', d => b2 += d);
        res2.on('end', () => console.log('Complaints status:', res2.statusCode, '\nBody:', b2));
      });
      req2.end();
    } catch (e) {
      console.error('Parse error:', e.message, body);
    }
  });
});
loginReq.on('error', e => console.error('Request error:', e.message));
loginReq.write(loginData);
loginReq.end();
