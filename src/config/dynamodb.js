const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

// Let the SDK automatically find credentials from environment variables
const client = new DynamoDBClient({
  region: process.env.AWS_REGION
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLES = {
  USERS: 'dnate-users',
  PERSONAS: 'dnate-personas',
  SESSIONS: 'dnate-sessions',
  QUESTIONS: 'dnate-questions'
};

// This function doesn't perform a real connection test,
// but confirms the client is configured.
async function testConnection() {
  if (client && docClient) {
    console.log('✅ DynamoDB client configured');
    return true;
  }
  console.error('❌ DynamoDB configuration failed');
  return false;
}

module.exports = {
  docClient,
  TABLES,
  testConnection
};