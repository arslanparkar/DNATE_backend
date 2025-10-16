const express = require('express');
const app = express();
const PORT = process.env.PORT || 5000;

app.get('/ping', (req, res) => {
  console.log('PING received!');
  res.send('PONG');
});

// Export the app for Vercel
module.exports = app;