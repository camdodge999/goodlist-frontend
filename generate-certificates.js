const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const certDir = path.join(__dirname, 'certificates');

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

try {
  console.log('Generating SSL certificates for localhost...');
  
  // Generate private key
  execSync(`openssl genrsa -out ${path.join(certDir, 'localhost-key.pem')} 2048`, { stdio: 'inherit' });
  
  // Generate certificate
  execSync(`openssl req -new -x509 -key ${path.join(certDir, 'localhost-key.pem')} -out ${path.join(certDir, 'localhost.pem')} -days 365 -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"`, { stdio: 'inherit' });
  
  console.log('✅ SSL certificates generated successfully!');
  console.log('📁 Certificates saved in:', certDir);
  console.log('🚀 You can now run: npm run start:https');
} catch (error) {
  console.error('❌ Error generating certificates:', error.message);
  console.log('\n💡 Alternative: Use mkcert for easier certificate generation:');
  console.log('   1. Install mkcert: https://github.com/FiloSottile/mkcert');
  console.log('   2. Run: mkcert -install');
  console.log('   3. Run: mkcert localhost');
  console.log('   4. Move the generated files to the certificates folder');
} 