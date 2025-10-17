const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

async function generateQuestions(persona, difficulty = 'medium', count = 5) {
  // Corrected the prompt to ask for a "text" key in the JSON
  const prompt = `Generate ${count} realistic, challenging questions that ${persona.name} (${persona.title}, ${persona.specialty}) would ask an MSL.

Context: ${persona.practice_setting.type}, ${persona.communication_style.tone}
Key Priorities: ${persona.priorities.slice(0, 3).join(', ')}

Return ONLY a JSON array of objects with "text", "category", and "difficulty" keys:
[{"text":"Your generated question here...","category":"Clinical Data & Evidence","difficulty":"${difficulty}"}]`;

  try {
    const result = await hf.chatCompletion({
      model: 'meta-llama/Meta-Llama-3-8B-Instruct',
      messages: [
        { role: 'system', content: 'You are an assistant that generates medical questions and returns ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const responseText = result.choices[0].message.content;
    
    // More robust regex to find the JSON array
    const jsonMatch = responseText.match(/(\[[\s\S]*\])/);
    if (jsonMatch && jsonMatch[0]) {
      const questions = JSON.parse(jsonMatch[0]);
      // Ensure every object has the correct "text" key
      return questions.map(q => ({
        text: q.text || q.question, // Standardize to "text"
        category: q.category,
        difficulty: q.difficulty,
        timeLimit: q.timeLimit || 90
      }));
    }
    
    throw new Error('Failed to parse JSON from AI response');
  } catch (error) {
    console.error('HF Error:', error.message);
    throw new Error('Failed to generate questions: ' + error.message);
  }
}

module.exports = { generateQuestions };