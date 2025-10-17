console.log('[LOG] Attempting to load: src/routes/index.js');

const express = require('express');
const router = express.Router();

// Middleware and Controllers
const { authenticateToken } = require('../middleware/auth');
const authController = require('../controllers/authController');
const personaController = require('../controllers/personaController');
const sessionController = require('../controllers/sessionController');
const recordingController = require('../controllers/recordingController');
const questionController = require('../controllers/questionController'); // Ensure this is imported

// --- Routes ---

// Health Check
router.get('/health', (req, res) => {
  res.json({ status: '🟢 HEALTHY', timestamp: new Date().toISOString() });
});

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authenticateToken, authController.me);

// Personas
router.get('/personas', authenticateToken, personaController.getAllPersonas);
router.get('/personas/:id', authenticateToken, personaController.getPersonaById);

// Questions (These were missing)
router.get('/questions', authenticateToken, questionController.getAllQuestions);
router.get('/questions/random', authenticateToken, (req, res) => {
    const questions = require('../data/questions.json').questions;
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    res.json({ success: true, question: randomQuestion });
});
router.get('/questions/:id', authenticateToken, questionController.getQuestionById);


// Sessions & Recordings
router.post('/sessions/start', authenticateToken, sessionController.startSession);
router.post('/sessions/:sessionId/answer', authenticateToken, sessionController.submitAnswer);
router.post('/sessions/:sessionId/complete', authenticateToken, sessionController.completeSession);
router.get('/sessions', authenticateToken, sessionController.getUserSessions);
router.get('/sessions/:sessionId', authenticateToken, sessionController.getSessionById);
router.post('/sessions/:sessionId/recording/upload-url', authenticateToken, recordingController.getUploadUrl);
router.post('/sessions/:sessionId/recording/process', authenticateToken, recordingController.processRecording);
router.get('/sessions/:sessionId/recording/:recordingIndex', authenticateToken, recordingController.getRecording);

console.log('[LOG] Successfully loaded: src/routes/index.js');

module.exports = router;