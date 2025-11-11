#!/usr/bin/env node
// Simple mock APIM server for local development (CommonJS version)
// Run: node scripts/mock-apim.cjs
const express = require('express');
const bodyParser = require('body-parser');

const fs = require('fs');
const path = require('path');
const app = express();
app.use(bodyParser.json());

// Enable CORS for local development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-project, x-app, x-user, x-environment, x-feature, x-request-id');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

const LOG_PATH = path.resolve(__dirname, 'mock-apim.log');
console.log('Mock APIM log file will be written to:', LOG_PATH);

function writeLog(entry) {
  const line = `[${new Date().toISOString()}] ${JSON.stringify(entry)}\n`;
  try {
    // Write synchronously to ensure ordering and immediate flush
    fs.appendFileSync(LOG_PATH, line);
    // Also log to console for visibility
    console.log(`Log entry: ${JSON.stringify(entry)}`);
  } catch (e) {
    console.error('Failed to write to log file:', e);
    console.error('Error details:', e.message);
    // Try to create file if it doesn't exist
    try {
      fs.writeFileSync(LOG_PATH, line);
      console.log('Created new log file');
    } catch (e2) {
      console.error('Failed to create log file:', e2.message);
    }
  }
}

const port = process.env.MOCK_APIM_PORT || 5178;

function randId() {
  return Math.random().toString(36).substring(2, 9);
}

app.post('/rag/answer', (req, res) => {
  const headers = req.headers;
  console.log('Received request headers:', headers);
  writeLog({ event: 'request-received', headers });

  const required = ['x-project', 'x-app', 'x-user'];
  const missing = required.filter(k => !headers[k]);
  if (missing.length) {
    console.warn('Missing APIM headers:', missing);
    writeLog({ event: 'missing-headers', missing, headers });
    // return 400 to simulate APIM enforcement
    return res.status(400).json({ error: `Missing headers: ${missing.join(', ')}` });
  }

  const { projectId, message, template } = req.body || {};
  const responseId = randId();

  const answer = `MOCK APIM (${projectId || 'unknown'}) Response ${responseId}: ${message} ${template ? `[template t=${template.temperature} k=${template.top_k} f=${template.source_filter}]` : ''}`;

  const metadata = {
    confidence: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100,
    sources: [`apim-mock-source-${responseId}-1`],
    processingTime: Math.floor(Math.random() * 500) + 200
  };

  // simulate latency
  const latency = Math.floor(Math.random() * 300) + 100;
  setTimeout(() => {
    const payload = { answer, metadata };
    writeLog({ event: 'response', projectId, message, template, metadata, latency });
    res.json(payload);
  }, latency);
});

app.listen(port, () => {
  const startupMessage = `Mock APIM server listening on http://localhost:${port}`;
  console.log(startupMessage);
  writeLog({ event: 'startup', message: startupMessage });
});
