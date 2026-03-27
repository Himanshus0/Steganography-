const express = require('express');
const cors = require('cors');
const path = require('path');
const steganographyRoutes = require('./routes/steganography');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api', steganographyRoutes);

// ── Health check ─────────────────────────────────────────────────────────── 
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ── Global error handler ─────────────────────────────────────────────────── 
app.use((err, _req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

// ── Start ────────────────────────────────────────────────────────────────── 
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🔒 Stegano Server running at http://localhost:${PORT}`);
  });
}

module.exports = app;
