const express = require('express');
const os = require('os');

const app = express();

app.get('/', (req, res) => {
  res.send(`<h1>DevOpsified App 🚀</h1>
<p>Version: ${process.env.APP_VERSION || 'dev'}</p>
<p>Served by pod: ${os.hostname()}</p>`);
});

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/api/info', (req, res) => {
  res.json({
    app: 'devopsify-app',
    version: process.env.APP_VERSION || 'dev',
    pod: os.hostname(),
    time: new Date().toISOString(),
  });
});

module.exports = app;
