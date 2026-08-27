import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', app: 'DC NONBUAH · Sistem Retur & Master Data' });
});

// Serve static assets with appropriate headers
app.use(express.static(__dirname, {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));

// Route fallback for SPA
app.use((_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[GudangPro] Server running on http://0.0.0.0:${PORT}`);
});
