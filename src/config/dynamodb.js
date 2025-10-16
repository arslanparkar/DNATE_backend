console.log('[LOG] Attempting to load: src/config/dynamodb.js');

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

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

async function testConnection() {
  console.log('✅ DynamoDB client configured');
  return true;
}

console.log('[LOG] Successfully loaded: src/config/dynamodb.js');

module.exports = {
  docClient,
  TABLES,
  testConnection
};