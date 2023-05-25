import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const config = {
  runtime: "edge",
};

const openaiDecesion = async (req) => {
  const { question, optionA, optionB } = await req.json();

  const prompt = `Based on the two options ${optionA} and ${optionB} in the context of ${question}, recommend me the best option. No need to provide pros and cons, only the best option.
    The response should be in the following format:
    The best option is: 

`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "Act as a professional consultant and recommend the best option based on the following options. Make sure to always format the result in the way i told you.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 200,
        temperature: 0,
      }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ response: data.choices[0].message.content }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
export default openaiDecesion;
