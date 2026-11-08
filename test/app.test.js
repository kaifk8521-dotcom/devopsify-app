const test = require('node:test');
const assert = require('node:assert');
const http = require('node:http');
const app = require('../src/app');

function get(server, path) {
  return new Promise((resolve, reject) => {
    http.get({ port: server.address().port, path }, (res) => {
      let body = '';
      res.on('data', (c) => (body += c));
      res.on('end', () => resolve({ status: res.statusCode, body }));
    }).on('error', reject);
  });
}

test('health and info endpoints', async () => {
  const server = app.listen(0);
  try {
    const health = await get(server, '/health');
    assert.strictEqual(health.status, 200);
    assert.strictEqual(JSON.parse(health.body).status, 'ok');

    const info = await get(server, '/api/info');
    assert.strictEqual(info.status, 200);
    assert.strictEqual(JSON.parse(info.body).app, 'devopsify-app');
  } finally {
    server.close();
  }
});
