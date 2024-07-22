import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { messages } = req.body;

        try {
            const response = await axios.post(
                'https://api.endpoints.anyscale.com/v1/chat/completions',
                {
                    model: 'meta-llama/Llama-2-7b-chat-hf',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an AI assistant specializing in allergy information and treatments. Provide accurate and helpful information about allergies, their symptoms, and potential treatments. If you\'re unsure about something, say so and recommend consulting a healthcare professional.'
                        },
                        ...messages
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${process.env.ANYSCALE_API_KEY}`,
                    },
                }
            );

            const rawContent = response.data.choices[0].message.content;

            // Replace newlines with <br> to preserve paragraph formatting
            const formattedContent = rawContent.replace(/\n/g, '<br>');

            res.status(200).json({ reply: formattedContent });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred while processing your request.' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
