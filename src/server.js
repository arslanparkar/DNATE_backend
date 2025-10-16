console.log('--- Serverless Function Starting ---');

try {
  console.log('Step 1: Requiring modules...');
  const express = require('express');
  const cors = require('cors');
  require('dotenv').config();
  console.log('Step 1: Modules required successfully.');

  console.log('Step 2: Initializing Express app...');
  const app = express();
  const PORT = process.env.PORT || 5000;
  console.log('Step 2: Express app initialized.');

  console.log('Step 3: Configuring CORS...');
  const corsOptions = {
    origin: 'https://dnatefrontend.vercel.app',
    optionsSuccessStatus: 200
  };
  app.use(cors(corsOptions));
  console.log('Step 3: CORS configured.');

  console.log('Step 4: Configuring middleware...');
  app.use(express.json());
  console.log('Step 4: Middleware configured.');

  console.log('Step 5: Loading routes...');
  const routes = require('./routes');
  app.use('/api', routes);
  console.log('Step 5: Routes loaded successfully.');

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      message: '🚀 DNATE Question Bot API',
      version: '1.0.0',
      status: 'running'
    });
  });

  console.log('Step 6: Exporting app...');
  module.exports = app;
  console.log('--- Serverless Function Initialized Successfully ---');

} catch (error) {
  console.error('--- CRITICAL STARTUP ERROR ---');
  console.error(error);
  // Ensure the process exits on a critical error during init
  process.exit(1);
}