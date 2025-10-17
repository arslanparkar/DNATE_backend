const { docClient, TABLES } = require('../config/dynamodb');
const { ScanCommand, GetCommand } = require('@aws-sdk/lib-dynamodb'); // Import commands

exports.getAllPersonas = async (req, res) => {
  try {
    const result = await docClient.send(new ScanCommand({
      TableName: TABLES.PERSONAS
    }));

    res.json({
      success: true,
      count: result.Items.length,
      personas: result.Items
    });
  } catch (error) {
    console.error('Get personas error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personas'
    });
  }
};

exports.getPersonaById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await docClient.send(new GetCommand({
      TableName: TABLES.PERSONAS,
      Key: { personaId: id }
    }));

    if (!result.Item) {
      return res.status(404).json({
        success: false,
        error: 'Persona not found'
      });
    }

    res.json({
      success: true,
      persona: result.Item
    });
  } catch (error) {
    console.error('Get persona error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch persona'
    });
  }
};