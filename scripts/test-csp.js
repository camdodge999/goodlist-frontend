#!/usr/bin/env node

/**
 * CSP Header Test Script
 * Tests that CSP headers are properly set on various routes
 */

const http = require('http');
const https = require('https');

const TEST_ROUTES = [
  '/',
  '/api/health',
  '/stores',
  '/login',
  '/api/csp-report'
];

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https:') ? https : http;
    
    const req = protocol.get(url, (res) => {
      const headers = res.headers;
      resolve({
        url,
        statusCode: res.statusCode,
        cspHeader: headers['content-security-policy'] || headers['content-security-policy-report-only'],
        hasCSP: !!(headers['content-security-policy'] || headers['content-security-policy-report-only']),
        otherSecurityHeaders: {
          'x-content-type-options': headers['x-content-type-options'],
          'x-frame-options': headers['x-frame-options'],
          'x-xss-protection': headers['x-xss-protection'],
          'referrer-policy': headers['referrer-policy'],
          'permissions-policy': headers['permissions-policy']
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function testCSPHeaders() {
  console.log('🔍 Testing CSP Headers Implementation');
  console.log(`📍 Base URL: ${BASE_URL}`);
  console.log('=' * 50);

  const results = [];

  for (const route of TEST_ROUTES) {
    const url = `${BASE_URL}${route}`;
    
    try {
      console.log(`\n🧪 Testing: ${route}`);
      const result = await makeRequest(url);
      results.push(result);

      console.log(`   Status: ${result.statusCode}`);
      console.log(`   CSP Present: ${result.hasCSP ? '✅' : '❌'}`);
      
      if (result.hasCSP) {
        const cspType = result.cspHeader.includes('report-only') ? 'Report-Only' : 'Enforced';
        console.log(`   CSP Type: ${cspType}`);
        
        // Check for key directives
        const keyDirectives = ['default-src', 'script-src', 'style-src', 'form-action'];
        const missingDirectives = keyDirectives.filter(directive => 
          !result.cspHeader.includes(directive)
        );
        
        if (missingDirectives.length === 0) {
          console.log(`   Key Directives: ✅ All present`);
        } else {
          console.log(`   Missing Directives: ❌ ${missingDirectives.join(', ')}`);
        }

        // Check for unsafe directives
        const unsafeDirectives = ['unsafe-inline', 'unsafe-eval'];
        const foundUnsafe = unsafeDirectives.filter(directive => 
          result.cspHeader.includes(directive)
        );
        
        if (foundUnsafe.length === 0) {
          console.log(`   Unsafe Directives: ✅ None found`);
        } else {
          console.log(`   Unsafe Directives: ⚠️  ${foundUnsafe.join(', ')}`);
        }
      }

      // Check other security headers
      const securityHeaders = Object.entries(result.otherSecurityHeaders)
        .filter(([_, value]) => value)
        .map(([header, _]) => header);
      
      console.log(`   Security Headers: ${securityHeaders.length}/5 present`);

    } catch (error) {
      console.log(`   Error: ❌ ${error.message}`);
      results.push({ url, error: error.message, hasCSP: false });
    }
  }

  // Summary
  console.log('\n' + '=' * 50);
  console.log('📊 SUMMARY');
  console.log('=' * 50);

  const successfulTests = results.filter(r => !r.error);
  const withCSP = results.filter(r => r.hasCSP);
  
  console.log(`Total Routes Tested: ${TEST_ROUTES.length}`);
  console.log(`Successful Requests: ${successfulTests.length}`);
  console.log(`Routes with CSP: ${withCSP.length}`);
  
  if (withCSP.length === successfulTests.length && successfulTests.length > 0) {
    console.log('\n🎉 SUCCESS: All routes have CSP headers!');
  } else if (withCSP.length > 0) {
    console.log('\n⚠️  PARTIAL: Some routes missing CSP headers');
  } else {
    console.log('\n❌ FAILURE: No CSP headers found');
  }

  // Detailed CSP analysis for first successful route
  const firstWithCSP = withCSP[0];
  if (firstWithCSP) {
    console.log('\n📋 Sample CSP Header:');
    console.log(firstWithCSP.cspHeader);
  }

  return withCSP.length === successfulTests.length && successfulTests.length > 0;
}

// Run the test
if (require.main === module) {
  testCSPHeaders()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = { testCSPHeaders }; 