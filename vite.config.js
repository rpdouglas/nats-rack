/**
 * 2026-01-04 PHASE 5: DEPLOYMENT & HOSTING
 * - Configured with Git Hash injection.
 * - Fixed linting error in catch block.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// 1. Get Version from package.json
const packageJson = JSON.parse(readFileSync('./package.json'));

// 2. Get Git Commit Hash
let commitHash = 'dev';
try {
  commitHash = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // Use default 'dev' if git fails or isn't installed
  console.warn('Git hash lookup failed (not a git repo?)');
}

// 3. Get Build Date
const buildDate = new Date().toISOString();

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  // Inject globals for UI visualization
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
    __GIT_HASH__: JSON.stringify(commitHash),
    __BUILD_DATE__: JSON.stringify(buildDate),
  },
  server: {
    port: 8080,
    strictPort: true,
    host: true
  }
})