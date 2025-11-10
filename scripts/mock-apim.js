#!/usr/bin/env node
// Simple mock APIM server for local development
// Run: node scripts/mock-apim.js
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const port = process.env.MOCK_APIM_PORT || 5178;

function randId() {
  return Math.random().toString(36).substring(2, 9);
}

app.post('/rag/answer', (req, res) => {
  const headers = req.headers;
  const required = ['x-project', 'x-app', 'x-user'];
  const missing = required.filter(k => !headers[k]);
  if (missing.length) {
    console.warn('Missing APIM headers:', missing);
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
  setTimeout(() => res.json({ answer, metadata }), Math.floor(Math.random() * 300) + 100);
});

app.listen(port, () => {
  console.log(`Mock APIM server listening on http://localhost:${port}`);
});
