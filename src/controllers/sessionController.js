const { v4: uuidv4 } = require('uuid');
const { docClient, TABLES } = require('../config/dynamodb');
const { generateQuestions } = require('../config/ai');
const { GetCommand, PutCommand, UpdateCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

exports.startSession = async (req, res) => {
  try {
    const { personaId, difficulty, questionCount } = req.body;
    const userId = req.user.userId;

    if (!personaId) {
      return res.status(400).json({ 
        success: false,
        error: 'Persona ID required' 
      });
    }

    const personaResult = await docClient.send(new GetCommand({
      TableName: TABLES.PERSONAS,
      Key: { personaId }
    }));

    if (!personaResult.Item) {
      return res.status(404).json({ 
        success: false,
        error: 'Persona not found' 
      });
    }

    const persona = personaResult.Item;
    let questions;

    // --- START OF THE FIX ---
    try {
      console.log('Attempting to generate questions from AI...');
      questions = await generateQuestions(persona, difficulty, questionCount);
      console.log('Successfully generated questions from AI.');
    } catch (aiError) {
      console.warn('AI question generation failed:', aiError.message);
      console.log('Using fallback questions instead.');
      
      // Shuffle the fallback questions and select the requested number
      const shuffled = [...fallbackQuestions].sort(() => 0.5 - Math.random());
      questions = shuffled.slice(0, questionCount).map(q => ({
          question: q.question,
          category: q.category,
          difficulty: q.difficulty,
          timeLimit: q.estimated_response_time || 90
      }));
    }

    const sessionId = uuidv4();
    const session = {
      sessionId,
      userId,
      personaId,
      personaName: persona.name,
      difficulty: difficulty || 'medium',
      questions,
      currentQuestionIndex: 0,
      answers: [],
      status: 'in_progress',
      createdAt: Date.now()
    };

    await docClient.send(new PutCommand({
      TableName: TABLES.SESSIONS,
      Item: session
    }));

    res.status(201).json({
      success: true,
      message: 'Session started',
      session: {
        sessionId,
        personaId,
        personaName: persona.name,
        questions,
        totalQuestions: questions.length
      }
    });
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to start session' 
    });
  }
};

exports.submitAnswer = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { questionIndex, answer, timeTaken, confidence } = req.body;
    const userId = req.user.userId;

    const sessionResult = await docClient.send(new GetCommand({
      TableName: TABLES.SESSIONS,
      Key: { sessionId }
    }));

    if (!sessionResult.Item) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }

    const session = sessionResult.Item;

    if (session.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const answers = session.answers || [];
    answers.push({
      questionIndex,
      answer,
      timeTaken,
      confidence,
      submittedAt: Date.now()
    });

    await docClient.send(new UpdateCommand({
      TableName: TABLES.SESSIONS,
      Key: { sessionId },
      UpdateExpression: 'SET answers = :answers, currentQuestionIndex = :nextIndex',
      ExpressionAttributeValues: {
        ':answers': answers,
        ':nextIndex': questionIndex + 1
      }
    }));

    res.json({
      success: true,
      message: 'Answer submitted',
      nextQuestionIndex: questionIndex + 1
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to submit answer' 
    });
  }
};

exports.completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const sessionResult = await docClient.send(new GetCommand({
      TableName: TABLES.SESSIONS,
      Key: { sessionId }
    }));

    if (!sessionResult.Item) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }

    const session = sessionResult.Item;

    if (session.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    const totalTime = session.answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
    const avgConfidence = session.answers.length > 0 
      ? session.answers.reduce((sum, a) => sum + (a.confidence || 0), 0) / session.answers.length
      : 0;

    await docClient.send(new UpdateCommand({
      TableName: TABLES.SESSIONS,
      Key: { sessionId },
      UpdateExpression: 'SET #status = :status, completedAt = :completedAt',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: {
        ':status': 'completed',
        ':completedAt': Date.now()
      }
    }));

    res.json({
      success: true,
      message: 'Session completed',
      stats: {
        totalQuestions: session.questions.length,
        totalTime,
        avgConfidence: avgConfidence.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to complete session' 
    });
  }
};

exports.getUserSessions = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await docClient.send(new QueryCommand({
      TableName: TABLES.SESSIONS,
      IndexName: 'UserSessionsIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: { ':userId': userId },
      ScanIndexForward: false
    }));

    res.json({
      success: true,
      count: result.Items.length,
      sessions: result.Items
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch sessions' 
    });
  }
};

exports.getSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.userId;

    const result = await docClient.send(new GetCommand({
      TableName: TABLES.SESSIONS,
      Key: { sessionId }
    }));

    if (!result.Item) {
      return res.status(404).json({ 
        success: false,
        error: 'Session not found' 
      });
    }

    if (result.Item.userId !== userId) {
      return res.status(403).json({ 
        success: false,
        error: 'Unauthorized' 
      });
    }

    res.json({
      success: true,
      session: result.Item
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch session' 
    });
  }
};