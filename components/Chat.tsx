import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import styles from '../styles/chat.module.css';

type Message = {
    role: 'human' | 'ai';
    content: string;
};

const predefinedQuestions = [
    "What are common food allergies?",
    "What are the symptoms of a peanut allergy?",
    "How can I treat a bee sting allergy?",
    "What should I do if I suspect an allergic reaction?",
    "What are the most common pet allergies?",
    "Can allergies be cured?", "What are the symptoms of a seasonal allergy?",
    "Are there any natural remedies for allergies?"

];

export function Chat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQuestions, setShowQuestions] = useState(true);
    const messagesEndRef = useRef<null | HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSubmit = async (e?: React.FormEvent, question?: string) => {
        if (e) e.preventDefault();
        const userInput = question || input;
        if (userInput.trim() && !isLoading) {
            setShowQuestions(false); // Hide predefined questions when a question is asked
            setIsLoading(true);
            const humanMessage: Message = { role: 'human', content: userInput };
            setMessages((prevMessages) => [...prevMessages, humanMessage]);
            setInput('');

            try {
                const response = await axios.post('/api/chat', {
                    messages: [...messages, humanMessage].map((msg) => ({
                        role: msg.role === 'human' ? 'user' : 'assistant',
                        content: msg.content,
                    })),
                });

                if (response.data && response.data.reply) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        { role: 'ai', content: response.data.reply },
                    ]);
                } else {
                    throw new Error('Unexpected response format');
                }
            } catch (error) {
                console.error('Error:', error);
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: 'ai', content: 'Sorry, I encountered an error. Please try again.' },
                ]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return (
        <div className={styles.chatContainer}>
            <header className={styles.chatHeading}>
                <h1 className={styles.chatTitle}>How can I help You With Allergies Related Treatment</h1>
            </header>
            {showQuestions && (
                <div className={styles.predefinedQuestions}>
                    <h1>Common Questions Asked</h1>
                    {predefinedQuestions.slice(0, 8).map((question, index) => (
                        <button
                            key={index}
                            className={styles.questionButton}
                            onClick={() => handleSubmit(undefined, question)}
                        >
                            {question}
                        </button>
                    ))}
                </div>
            )}
            <div className={styles.messagesArea}>
                {messages.map((message, i) => (
                    <div
                        key={i}
                        className={`${styles.message} ${message.role === 'human' ? styles.human : styles.ai}`}
                    >
                        <div
                            className={styles.messageContent}
                            dangerouslySetInnerHTML={{ __html: message.content }}
                        />
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className={styles.inputArea}>
                <input
                    type="text"
                    placeholder="Ask your question..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className={styles.inputField}
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className={styles.spinner}></div>
                    ) : (
                        <svg className={styles.sendIcon} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    )}
                </button>
            </form>
        </div>
    );
}
