console.log('[LOG] Attempting to load: src/routes/index.js');

const express = require('express');
const router = express.Router();

console.log('[LOG] Loading middleware/auth...');
const { authenticateToken } = require('../middleware/auth');
console.log('[LOG] Loaded middleware/auth.');

console.log('[LOG] Loading config/dynamodb...');
const { testConnection } = require('../config/dynamodb');
console.log('[LOG] Loaded config/dynamodb.');

console.log('[LOG] Loading controllers/authController...');
const authController = require('../controllers/authController');
console.log('[LOG] Loaded controllers/authController.');

console.log('[LOG] Loading controllers/personaController...');
const personaController = require('../controllers/personaController');
console.log('[LOG] Loaded controllers/personaController.');

console.log('[LOG] Loading controllers/sessionController...');
const sessionController = require('../controllers/sessionController');
console.log('[LOG] Loaded controllers/sessionController.');

console.log('[LOG] Loading controllers/recordingController...');
const recordingController = require('../controllers/recordingController');
console.log('[LOG] Loaded controllers/recordingController.');

// --- ADD THIS LINE ---
const questionController = require('../controllers/questionController');

router.get('/health', async (req, res) => {
  try {
    const dbConnected = await testConnection();
    res.json({
      status: dbConnected ? '🟢 HEALTHY' : '🔴 UNHEALTHY',
      database: dbConnected ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: '🔴 UNHEALTHY', error: error.message });
  }
});

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.me);
router.get('/personas', authenticateToken, personaController.getAllPersonas);
router.get('/personas/:id', authenticateToken, personaController.getPersonaById);

// --- ADD THESE LINES ---
router.get('/questions', authenticateToken, questionController.getAllQuestions);
router.get('/questions/filter', authenticateToken, questionController.filterQuestions);
router.get('/questions/categories', authenticateToken, questionController.getCategories);
router.get('/questions/category/:category', authenticateToken, questionController.getQuestionsByCategory);
router.get('/questions/persona/:personaId', authenticateToken, questionController.getQuestionsByPersona);
router.get('/questions/difficulty/:difficulty', authenticateToken, questionController.getQuestionsByDifficulty);
router.get('/questions/:id', authenticateToken, questionController.getQuestionById);
// ----------------------

router.post('/sessions/start', authenticateToken, sessionController.startSession);
router.post('/sessions/:sessionId/answer', authenticateToken, sessionController.submitAnswer);
router.post('/sessions/:sessionId/complete', authenticateToken, sessionController.completeSession);
router.get('/sessions', authenticateToken, sessionController.getUserSessions);
router.get('/sessions/:sessionId', authenticateToken, sessionController.getSessionById);
router.post('/sessions/:sessionId/recording/upload-url', authenticateToken, recordingController.getUploadUrl);
router.post('/sessions/:sessionId/recording/process', authenticateToken, recordingController.processRecording);
router.get('/sessions/:sessionId/recording/:recordingIndex', authenticateToken, recordingController.getRecording);
router.get('/sessions/:sessionId/recordings', authenticateToken, recordingController.getSessionRecordings);

console.log('[LOG] Successfully loaded: src/routes/index.js');

module.exports = router;