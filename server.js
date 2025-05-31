const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = false; // Set to false for production mode
const hostname = '127.0.0.1';
const port = process.env.PORT || 4200;

const app = next({ dev });
const handle = app.getRequestHandler();

// HTTPS options - you'll need to provide your own certificates
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, 'certificates/localhost-key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'certificates/localhost.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on https://${hostname}:${port} (Production Mode)`);
    });
}); 