import http from 'http';
import path from 'path';
import fs from 'fs';
import express from 'express';
import { app } from './app';
import { PORT, getGoogleApiKey } from './config';

// Re-export app and helper methods for backwards-compatibility and testing
export { app } from './app';
export { getGoogleApiKey } from './config';

const httpServer = http.createServer(app);

// Serve frontend static build in production if available
function setupFrontendServing() {
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
    // Check possible frontend dist paths
    const possiblePaths = [
      path.resolve(__dirname, '../../frontend/dist'),
      path.resolve(process.cwd(), '../frontend/dist'),
      path.resolve(process.cwd(), 'dist'),
    ];
    const distPath = possiblePaths.find((p) => fs.existsSync(p));

    if (distPath) {
      console.log(`[NanoTech Backend] Serving static frontend from: ${distPath}`);
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }
}

async function startServer() {
  setupFrontendServing();

  if (!process.env.VERCEL) {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`=========================================`);
      console.log(`NanoTech Backend API Server`);
      console.log(`Listening on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`=========================================`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
