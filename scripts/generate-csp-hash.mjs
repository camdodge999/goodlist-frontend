#!/usr/bin/env node

/**
 * CSP Hash Generator CLI
 * Generate SHA256 hashes for Content Security Policy
 * 
 * Usage:
 *   node scripts/generate-csp-hash.mjs "your inline content here"
 *   node scripts/generate-csp-hash.mjs --file path/to/file.css
 *   node scripts/generate-csp-hash.mjs --interactive
 */

import { createHash } from 'crypto';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate SHA256 hash for CSP
 */
function generateHash(content) {
  const hash = createHash('sha256');
  hash.update(content, 'utf8');
  const base64Hash = hash.digest('base64');
  return `'sha256-${base64Hash}'`;
}

/**
 * Display hash result
 */
function displayResult(content, hash, type = 'inline') {
  console.log('\n🔑 CSP Hash Generated');
  console.log('═'.repeat(50));
  console.log(`Content Type: ${type}`);
  console.log(`Content: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
  console.log(`Content Length: ${content.length} characters`);
  console.log(`SHA256 Hash: ${hash}`);
  console.log('═'.repeat(50));
  console.log('\n📋 Add to your CSP policy:');
  console.log(`style-src 'self' ${hash};`);
  console.log('\n🛠️  Add to middleware STATIC_STYLE_HASHES:');
  console.log(`"${content}": "${hash}",`);
  console.log('');
}

/**
 * Interactive mode
 */
async function interactiveMode() {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('🎯 Interactive CSP Hash Generator');
  console.log('Type your inline CSS/JS content (press Enter twice to finish):');
  console.log('');

  let content = '';
  let emptyLines = 0;

  rl.on('line', (line) => {
    if (line.trim() === '') {
      emptyLines++;
      if (emptyLines >= 2) {
        rl.close();
        return;
      }
    } else {
      emptyLines = 0;
      content += line + '\n';
    }
  });

  rl.on('close', () => {
    if (content.trim()) {
      const hash = generateHash(content.trim());
      displayResult(content.trim(), hash, 'interactive');
    } else {
      console.log('❌ No content provided');
    }
  });
}

/**
 * Process file content
 */
function processFile(filePath) {
  try {
    if (!existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      process.exit(1);
    }

    const content = readFileSync(filePath, 'utf8');
    const hash = generateHash(content);
    displayResult(content, hash, `file: ${filePath}`);
  } catch (error) {
    console.error(`❌ Error reading file: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Generate hashes for common patterns
 */
function generateCommonHashes() {
  const commonPatterns = {
    'display: none;': 'Hide elements',
    'visibility: hidden;': 'Hide elements but keep space',
    'opacity: 0;': 'Transparent elements',
    'opacity: 1;': 'Fully visible elements',
    'position: relative;': 'Relative positioning',
    'position: absolute;': 'Absolute positioning',
    'position: fixed;': 'Fixed positioning',
    'transform: translateX(-100%);': 'Slide left animation',
    'transform: translateX(100%);': 'Slide right animation',
    '': 'Empty style tag',
  };

  console.log('🎨 Common CSS Pattern Hashes');
  console.log('═'.repeat(60));
  
  Object.entries(commonPatterns).forEach(([css, description]) => {
    const hash = generateHash(css);
    console.log(`\n${description}:`);
    console.log(`CSS: ${css || '(empty)'}`);
    console.log(`Hash: ${hash}`);
  });

  console.log('\n📝 Ready-to-use array for middleware:');
  console.log('const STATIC_STYLE_HASHES = [');
  Object.keys(commonPatterns).forEach(css => {
    const hash = generateHash(css);
    console.log(`  "${hash}", // ${css || '(empty)'}`);
  });
  console.log('];');
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
🔒 CSP Hash Generator

Usage:
  node scripts/generate-csp-hash.mjs "your inline content"
  node scripts/generate-csp-hash.mjs --file path/to/file.css
  node scripts/generate-csp-hash.mjs --interactive
  node scripts/generate-csp-hash.mjs --common
  node scripts/generate-csp-hash.mjs --help

Examples:
  # Generate hash for inline style
  node scripts/generate-csp-hash.mjs "display: none;"
  
  # Generate hash for CSS file
  node scripts/generate-csp-hash.mjs --file src/styles/critical.css
  
  # Interactive mode
  node scripts/generate-csp-hash.mjs --interactive
  
  # Generate common pattern hashes
  node scripts/generate-csp-hash.mjs --common

Options:
  --file       Generate hash for file content
  --interactive Enter interactive mode
  --common     Generate hashes for common CSS patterns
  --help       Show this help message
`);
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help')) {
    showHelp();
    return;
  }

  if (args.includes('--interactive')) {
    interactiveMode();
    return;
  }

  if (args.includes('--common')) {
    generateCommonHashes();
    return;
  }

  if (args.includes('--file')) {
    const fileIndex = args.indexOf('--file');
    const filePath = args[fileIndex + 1];
    if (!filePath) {
      console.error('❌ Please provide a file path after --file');
      process.exit(1);
    }
    processFile(filePath);
    return;
  }

  // Direct content input
  const content = args.join(' ');
  if (content) {
    const hash = generateHash(content);
    displayResult(content, hash, 'command line');
  } else {
    console.error('❌ Please provide content to hash');
    showHelp();
    process.exit(1);
  }
}

// Run the script
main(); 