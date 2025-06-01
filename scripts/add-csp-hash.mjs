#!/usr/bin/env node

/**
 * Quick script to add CSP hashes from violation error messages
 * Usage: node scripts/add-csp-hash.mjs "CSP error message here"
 */

import fs from 'fs';
import path from 'path';

// Extract hash from CSP violation error message
function extractHashFromCSPError(errorMessage) {
  // Look for hash suggestions in parentheses like "a hash ('sha256-...')"
  const hashMatch = errorMessage.match(/\('(sha256-[A-Za-z0-9+/]+=*)'\)/);
  if (hashMatch) {
    return `'${hashMatch[1]}'`;
  }
  
  // Fallback: look for any sha256 hash in the message
  const fallbackMatch = errorMessage.match(/sha256-[A-Za-z0-9+/]+=*/);
  return fallbackMatch ? `'${fallbackMatch[0]}'` : null;
}

// Get CSP error message from command line argument
const errorMessage = process.argv[2];

if (!errorMessage) {
  console.log('❌ Please provide a CSP violation error message');
  console.log('Usage: node scripts/add-csp-hash.mjs "CSP error message here"');
  console.log('');
  console.log('Example:');
  console.log('node scripts/add-csp-hash.mjs "...a hash (\'sha256-PhrR5O1xWiklTp5YfH8xWeig83Y/rhbrdb5whLn1pSg=\')..."');
  process.exit(1);
}

// Extract hash from error message
const hash = extractHashFromCSPError(errorMessage);

if (!hash) {
  console.log('❌ Could not extract hash from error message');
  console.log('Make sure the error message contains a sha256 hash suggestion');
  process.exit(1);
}

console.log(`✅ Extracted hash: ${hash}`);

// Read the current csp-utils.ts file
const cspUtilsPath = path.join(process.cwd(), 'src', 'lib', 'csp-utils.ts');

try {
  const content = fs.readFileSync(cspUtilsPath, 'utf8');
  
  // Check if hash already exists
  if (content.includes(hash)) {
    console.log('ℹ️  Hash already exists in KNOWN_STYLE_HASHES');
    process.exit(0);
  }
  
  // Find the KNOWN_STYLE_HASHES array and add the new hash
  const knownHashesRegex = /(export const KNOWN_STYLE_HASHES = \[[\s\S]*?)(  \/\/ Add more known hashes here as needed\n\];)/;
  
  if (knownHashesRegex.test(content)) {
    const updatedContent = content.replace(
      knownHashesRegex,
      `$1  ${hash}, // Added from CSP violation\n  $2`
    );
    
    fs.writeFileSync(cspUtilsPath, updatedContent);
    console.log('✅ Successfully added hash to KNOWN_STYLE_HASHES array');
    console.log('🔄 Please restart your development server to apply changes');
  } else {
    console.log('❌ Could not find KNOWN_STYLE_HASHES array in csp-utils.ts');
    console.log('💡 Please manually add this hash to the array:');
    console.log(`   ${hash},`);
  }
  
} catch (error) {
  console.error('❌ Error reading/writing csp-utils.ts:', error.message);
  console.log('💡 Please manually add this hash to KNOWN_STYLE_HASHES array:');
  console.log(`   ${hash},`);
} 