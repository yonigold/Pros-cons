import axios from 'axios';


export const config = {
  runtime: "edge",
};

export async function middleware(req) {
  const { question, optionA, optionB } = req.body;

  const prompt = `Provide me the pros and cons of this two options ${optionA} and ${optionB} in the context of ${question}.

  The response should always be in the following format:
  ${optionA}:
  Pros:
  1. 
  2.
  3.
  Cons:
  1.
  2.
  3.
  ${optionB}:
  Pros:
  1. 
  2.
  3.
  Cons:
  1.
  2.
  3.
  `;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: 'system',
          content: 'Act as a professional consultant and provide me the pros and cons of this two options and recommend me the best option based on the analysis. Make sure to always format the result in the way i told you. make sure to provide unique pros and cons for each option.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    });
    
    return new Response(JSON.stringify({ response: response.data.choices[0].message.content }), { status: 200, headers: { 'Content-Type': 'application/json' }});
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
  }
}

