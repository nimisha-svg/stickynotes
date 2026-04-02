const esbuild = require('esbuild');
const path = require('path');
const fs = require('fs');

const isWatch = process.argv.includes('--watch');

// Simple dotenv parser for esbuild define
let envVars = {};
try {
  const envFile = fs.readFileSync('.env', 'utf8');
  envFile.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      envVars[`process.env.${match[1]}`] = JSON.stringify(match[2].trim());
    }
  });
} catch (e) {
  console.log('No .env file found or error reading it.');
}

const buildOptions = {
  entryPoints: {
    'sidepanel': './src/sidepanel/index.tsx',
    'content': './src/content/content.tsx',
    'background': './src/background/background.ts',
  },
  bundle: true,
  outdir: '.',
  format: 'iife',
  target: ['chrome90'],
  loader: {
    '.tsx': 'tsx',
    '.ts': 'ts',
    '.css': 'css',
  },
  minify: !isWatch,
  sourcemap: isWatch,
  define: {
    'process.env.NODE_ENV': isWatch ? '"development"' : '"production"',
    ...envVars
  }
};

async function build() {
  try {
    if (isWatch) {
      const ctx = await esbuild.context(buildOptions);
      await ctx.watch();
      console.log('Watching for changes...');
    } else {
      await esbuild.build(buildOptions);
      console.log('Build complete!');
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();