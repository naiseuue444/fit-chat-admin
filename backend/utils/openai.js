const OpenAI = require('openai');
const { getGymConfig } = require('./supabase');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function generateAIResponse(message, gymId) {
  try {
    // Get gym-specific configuration
    const config = await getGymConfig(gymId);
    
    // Create a prompt based on the message and gym configuration
    const prompt = createPrompt(message, config);
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful fitness assistant for a gym." },
        { role: "user", content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    return "I'm sorry, I'm having trouble processing your request right now. Please try again later.";
  }
}

function createPrompt(message, config) {
  // Check if message matches any specific intents
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('meal') || lowerMessage.includes('diet')) {
    return config.meal_prompt + ' ' + message;
  } 
  
  if (lowerMessage.includes('workout') || lowerMessage.includes('exercise')) {
    return config.workout_prompt + ' ' + message;
  }
  
  if (lowerMessage.includes('hi') || lowerMessage.includes('hello')) {
    return config.welcome_template + ' ' + message;
  }
  
  // Default response
  return message;
}

module.exports = {
  generateAIResponse
};
