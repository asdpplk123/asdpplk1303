import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig} from 'vite';

function collectProjectFiles(rootDir: string): Record<string, string> {
  const files: Record<string, string> = {};
  const rootFiles = [
    '.env.example',
    '.gitignore',
    'README.md',
    'index.html',
    'metadata.json',
    'package.json',
    'tsconfig.json',
    'vercel.json',
    'vite.config.ts',
  ];

  for (const name of rootFiles) {
    const fullPath = path.join(rootDir, name);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      files[name] = fs.readFileSync(fullPath, 'utf-8');
    }
  }

  const walkDir = (dir: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name.startsWith('.')
      ) {
        continue;
      }
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walkDir(fullPath);
      } else if (entry.isFile()) {
        const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');
        files[relPath] = fs.readFileSync(fullPath, 'utf-8');
      }
    }
  };

  walkDir(path.join(rootDir, 'src'));
  return files;
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'project-files-virtual-module',
        resolveId(id: string): string | undefined {
          if (id === 'virtual:project-files') {
            return '\0virtual:project-files';
          }
          return undefined;
        },
        load(id: string): string | undefined {
          if (id === '\0virtual:project-files') {
            const files = collectProjectFiles(__dirname);
            return `export default ${JSON.stringify(files)};`;
          }
          return undefined;
        },
      },
      // Copies src/assets into dist/ so root-relative URLs like
      // "/src/assets/images/..." (e.g. generate_image output) still resolve
      // in production builds. Do not remove.
      {
        name: 'copy-unbundled-src-assets',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const distDir = path.resolve(__dirname, 'dist');
          const srcAssets = path.resolve(__dirname, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, {recursive: true, force: true});
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
