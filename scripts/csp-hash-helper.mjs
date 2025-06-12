#!/usr/bin/env node

/**
 * CSP Hash Helper - Quickly add new hashes from CSP violations
 * 
 * Usage:
 * node scripts/csp-hash-helper.mjs --add "sha256-ABC123..." 
 * node scripts/csp-hash-helper.mjs --content "display: none;"
 * node scripts/csp-hash-helper.mjs --extract "Either the 'unsafe-inline' keyword, a hash ('sha256-MtxTLcyxVEJFNLEIqbVTaqR4WWr0+lYSZ78AzGmNsuA='), or a nonce..."
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSP_UTILS_PATH = path.resolve(__dirname, '../src/lib/csp-utils.ts');

// Extract hash from CSP error message
function extractHashFromError(errorMessage) {
  const hashMatch = errorMessage.match(/'sha256-([A-Za-z0-9+/=]+)'/);
  return hashMatch ? hashMatch[0] : null;
}

// Generate SHA-256 hash for content
function generateSHA256Hash(content) {
  const hash = crypto.createHash('sha256').update(content.trim(), 'utf8').digest('base64');
  return `'sha256-${hash}'`;
}

// Add hash to CSP utils file
function addHashToCspUtils(hash, description = '') {
  try {
    let content = fs.readFileSync(CSP_UTILS_PATH, 'utf8');
    
    // Find the KNOWN_STYLE_HASHES array
    const hashArrayStart = content.indexOf('export const KNOWN_STYLE_HASHES = [');
    const hashArrayEnd = content.indexOf('];', hashArrayStart);
    
    if (hashArrayStart === -1 || hashArrayEnd === -1) {
      throw new Error('Could not find KNOWN_STYLE_HASHES array in csp-utils.ts');
    }
    
    // Check if hash already exists
    if (content.includes(hash)) {
      console.log(`✅ Hash ${hash} already exists in KNOWN_STYLE_HASHES`);
      return;
    }
    
    // Insert the new hash before the closing bracket
    const beforeClosing = content.substring(0, hashArrayEnd);
    const afterClosing = content.substring(hashArrayEnd);
    
    const comment = description ? ` // ${description}` : ' // Added via csp-hash-helper';
    const newHashLine = `  ${hash},${comment}\n  `;
    
    const updatedContent = beforeClosing + newHashLine + afterClosing;
    
    fs.writeFileSync(CSP_UTILS_PATH, updatedContent);
    console.log(`✅ Added hash ${hash} to KNOWN_STYLE_HASHES`);
    
  } catch (error) {
    console.error('❌ Error adding hash to CSP utils:', error.message);
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
CSP Hash Helper - Manage CSP hashes easily

Usage:
  --add "sha256-ABC123..."     Add a hash directly  
  --content "display: none;"   Generate hash from content
  --extract "CSP error msg"    Extract hash from CSP error message

Examples:
  node scripts/csp-hash-helper.mjs --add "sha256-MtxTLcyxVEJFNLEIqbVTaqR4WWr0+lYSZ78AzGmNsuA="
  node scripts/csp-hash-helper.mjs --content "display: none;"
  node scripts/csp-hash-helper.mjs --extract "Either the 'unsafe-inline' keyword, a hash ('sha256-ABC123='), or a nonce"
`);
    return;
  }
  
  const command = args[0];
  const value = args[1];
  
  switch (command) {
    case '--add':
      if (!value) {
        console.error('❌ Please provide a hash to add');
        return;
      }
      addHashToCspUtils(value);
      break;
      
    case '--content':
      if (!value) {
        console.error('❌ Please provide content to hash');
        return;
      }
      const hash = generateSHA256Hash(value);
      console.log(`Generated hash: ${hash}`);
      addHashToCspUtils(hash, `Generated from: ${value.substring(0, 30)}...`);
      break;
      
    case '--extract':
      if (!value) {
        console.error('❌ Please provide CSP error message');
        return;
      }
      const extractedHash = extractHashFromError(value);
      if (extractedHash) {
        console.log(`Extracted hash: ${extractedHash}`);
        addHashToCspUtils(extractedHash, 'Extracted from CSP violation');
      } else {
        console.error('❌ No hash found in error message');
      }
      break;
      
    default:
      console.error('❌ Unknown command. Use --add, --content, or --extract');
  }
}

main(); 