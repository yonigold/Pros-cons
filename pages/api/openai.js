import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export const config = {
    runtime: "edge",
  };

const openai = async (req) => {
    const { question, optionA, optionB } = await req.json();
    const prompt = `Provide me the pros and cons of this two options ${optionA} and ${optionB} in the context of ${question}. only respons with pros and cons.
    
    The response should always be in the following format: 
    ${optionA}:
    pros:
    1.
    2.
    cons: 
    1.
    2. 
    ${optionB}: 
    pros: 
    1. 
    2. 
    cons: 
    1. 
    2.`;

    try {
         const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: 'system',
                content: 'Act as a professional consultant. Make sure to always format the result in the way i told you. make sure to provide unique pros and cons for each option.'

            },
            {
                role: 'user',
                content: prompt
            }
        ],
        max_tokens: 700,
        temperature: 0,
        })
        
    });

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const data = await response.json();

    return new Response(JSON.stringify({ response: data.choices[0].message.content }), { status: 200, headers: { 'Content-Type': 'application/json' }});
    } catch (error) {
        console.log(error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' }});
    }
}
export default openai;


