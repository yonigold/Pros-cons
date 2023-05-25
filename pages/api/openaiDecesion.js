import axios from 'axios';

const openaiDecesion =  async (req, res) => {
    const { question, optionA, optionB } = req.body;

    const prompt = `Based on the two options ${optionA} and ${optionB} in the context of ${question}, recommend me the best option. No need to provide pros and cons, only the best option.
    format the response in the following format:
    The best option is: 

`

try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [
            {
                role: 'system',
                content: 'Act as a professional consultant and recommend the best option based on the following options.'
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

    

res.status(200).json({ response: response.data.choices[0].message.content });

} catch (error) {
    console.log(error.response.data);
    res.status(500).json({ error: error.message });

}
}
export default openaiDecesion;
