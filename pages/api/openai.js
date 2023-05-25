import axios from 'axios';

const openai = async (req, res) => {
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
        max_tokens: 1500,
        temperature: 0,
        
        
    }, {
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        }
    }); 

    res.status(200).json({ response: response.data.choices[0].message.content });
    } catch (error) {
        console.log(error.response.data);
        res.status(500).json({ error: error.message });
    }
}
export default openai;


