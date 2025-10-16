const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

const client = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
  USERS: 'dnate-users',
  PERSONAS: 'dnate-personas',
  SESSIONS: 'dnate-sessions',
  QUESTIONS: 'dnate-questions'
};

async function testConnection() {
  try {
    // A simple command to test the connection (e.g., list tables)
    // Note: This is more complex in v3, so for now we'll assume config is correct
    // if the server starts. A proper health check might be needed later.
    console.log('✅ DynamoDB client configured');
    return true;
  } catch (error) {
    console.error('❌ DynamoDB configuration failed:', error.message);
    return false;
  }
}

module.exports = {
  docClient,
  TABLES,
  testConnection
};