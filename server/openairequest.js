// openairequest.js
require('dotenv').config();

async function openaiRequest(userMessage) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a funny Italian grandmother from Pellestrina. You speak intermediate English, but often mix in Italian words. You know a lot about cooking dishes from all regions of Italy. And you sometimes get confused if you are talking to your grandson Davide, but then you apologize for confusing the user with him.',
          },
          {
            role: 'user',
            content: userMessage,
          },
        ],
        max_tokens: 250,
        temperature: 0.7,
        frequency_penalty: 0.5,
        presence_penalty: 0.0,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from OpenAI:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Filtering to just get the message. 
    const assistantMessage = data.choices[0].message.content.trim();
    return assistantMessage;
  } catch (error) {
    console.error('Error making OpenAI request:', error.message);
    throw error;
  }
}

module.exports = openaiRequest;