import React, { useState, useRef, useEffect } from 'react';
import type { Chat } from '@google/genai';
import { continueChatStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { LogoIcon, PaperAirplaneIcon } from './IconComponents';

interface InteractiveChatProps {
    chatSession: Chat;
}

const InteractiveChat: React.FC<InteractiveChatProps> = ({ chatSession }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim() || isLoading) return;

        const newUserMessage: ChatMessage = {
            role: 'user',
            parts: [{ text: userInput }],
        };
        setMessages(prev => [...prev, newUserMessage]);
        setUserInput('');
        setIsLoading(true);
        setError(null);

        try {
            const stream = await continueChatStream(chatSession, userInput);
            
            let modelResponse = '';
            setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

            for await (const chunk of stream) {
                modelResponse += chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].parts[0].text = modelResponse;
                    return newMessages;
                });
            }

        } catch (err) {
            setError('Sorry, something went wrong. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full animate-fade-in">
            <h3 className="text-lg font-semibold text-brand-text-primary mb-2">Interactive AI Analyst</h3>
            <p className="text-sm text-brand-text-secondary mb-4">Ask a follow-up question about the report above.</p>
            
            <div ref={chatContainerRef} className="flex-grow bg-brand-primary/50 p-4 rounded-lg border border-brand-border overflow-y-auto h-64 min-h-[16rem] space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                           <div className="w-8 h-8 flex-shrink-0 bg-brand-accent/10 rounded-full flex items-center justify-center">
                             <LogoIcon className="w-5 h-5 text-brand-accent" />
                           </div>
                        )}
                        <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-brand-accent text-brand-primary' : 'bg-brand-secondary'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.parts[0].text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && messages[messages.length-1]?.role === 'user' && (
                     <div className="flex items-start gap-3 justify-start">
                         <div className="w-8 h-8 flex-shrink-0 bg-brand-accent/10 rounded-full flex items-center justify-center">
                            <LogoIcon className="w-5 h-5 text-brand-accent" />
                         </div>
                         <div className="max-w-md p-3 rounded-lg bg-brand-secondary">
                             <div className="flex items-center justify-center space-x-1">
                                <div className="w-2 h-2 bg-brand-text-secondary rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                <div className="w-2 h-2 bg-brand-text-secondary rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                <div className="w-2 h-2 bg-brand-text-secondary rounded-full animate-pulse"></div>
                             </div>
                         </div>
                     </div>
                 )}
            </div>

            {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

            <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-3">
                <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="e.g., Explain the key factors in more detail..."
                    className="flex-grow bg-brand-primary border border-brand-border rounded-md p-3 text-brand-text-primary focus:ring-2 focus:ring-brand-accent focus:outline-none transition placeholder:text-gray-500 disabled:opacity-50"
                    disabled={isLoading}
                />
                <button
                    type="submit"
                    disabled={isLoading || !userInput.trim()}
                    className="p-3 bg-brand-accent text-brand-primary rounded-md hover:opacity-90 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                    aria-label="Send message"
                >
                    <PaperAirplaneIcon className="w-6 h-6" />
                </button>
            </form>
        </div>
    );
};

export default InteractiveChat;