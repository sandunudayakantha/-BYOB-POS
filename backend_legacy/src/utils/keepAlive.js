const https = require('https');

const keepAlive = () => {
  // Render automatically provides this environment variable containing your app's public URL
  const url = process.env.RENDER_EXTERNAL_URL;

  if (!url) {
    console.log('[KeepAlive] Not running on Render (or RENDER_EXTERNAL_URL not set). Skipping keep-alive setup.');
    return;
  }

  // Ping the health endpoint every 14 minutes (840000 milliseconds)
  const interval = 14 * 60 * 1000;
  
  setInterval(() => {
    https.get(`${url}/api/health`, (res) => {
      if (res.statusCode === 200) {
        console.log(`[KeepAlive] Successfully pinged ${url} to prevent Render from sleeping.`);
      } else {
        console.log(`[KeepAlive] Ping failed with status: ${res.statusCode}`);
      }
    }).on('error', (err) => {
      console.error('[KeepAlive] Error during ping:', err.message);
    });
  }, interval);

  console.log(`[KeepAlive] Internal cron started. Pinging ${url} every 14 minutes.`);
};

module.exports = keepAlive;
