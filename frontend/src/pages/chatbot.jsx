import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Loader2, ArrowLeft, SendHorizontal, Mic, MicOff } from 'lucide-react'; // Added icons
import toast from 'react-hot-toast';

const Chatbot = () => {
    const navigate = useNavigate();
    const [input, setInput] = useState('');
    const [chatHistory, setChatHistory] = useState([]); 
    const [summary, setSummary] = useState(''); 
    const [listening, setListening] = useState(false);
    const [isSending, setIsSending] = useState(false); // Loading state for sending
    const recognitionRef = useRef(null);
    const messagesEndRef = useRef(null); // Ref for scrolling

    // --- Speech Recognition Setup (Original Logic) ---
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US';
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onresult = (event) => {
                const transcript = event.results[event.results.length - 1][0].transcript.trim();
                setInput(transcript);
                setListening(false);
                toast.success("Voice input captured.");
            };
            recognition.onspeechend = () => {
                 recognition.stop();
                 setListening(false);
             };
            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                toast.error(`Speech error: ${event.error}`);
                setListening(false);
            };
             recognition.onend = () => { // Ensure listening state is reset if it stops unexpectedly
                 setListening(false);
             };
            recognitionRef.current = recognition;
        } else {
            console.warn('Speech Recognition API is not supported in this browser.');
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast.error("Voice input is not supported by your browser.");
            return;
        }
        if (listening) {
            recognitionRef.current.stop();
            setListening(false);
        } else {
            setInput(""); // Clear input before starting
            setListening(true);
            try {
                recognitionRef.current.start();
                 toast("Listening...", { icon: '🎤' });
            } catch (error) {
                 console.error("Error starting recognition:", error);
                 toast.error("Could not start voice input.");
                 setListening(false);
            }
        }
    };
    // --- End Speech Recognition ---

    // --- Chat Submission Logic (Original Logic) ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault(); // Allow calling without event
        if (!input.trim() || isSending) return;

        const userMessage = { sender: 'user', text: input };
        setChatHistory((prev) => [...prev, userMessage]);
        const currentInput = input; // Store before clearing
        setInput('');
        setIsSending(true);
        
        // Ensure summary is a string before sending
        const summaryToSend = typeof summary === 'object' && summary !== null ? summary.content : summary || "";
        
        try {
            // 1. Call /chat endpoint
            const chatResponse = await axios.post('http://127.0.0.1:8000/chat', {
                chat_history: summaryToSend, 
                question: currentInput,
            });
            const botReply = chatResponse.data.response;
            const botMessage = { sender: 'bot', text: botReply };
            setChatHistory((prev) => [...prev, botMessage]);

            // 2. Call /summarize endpoint (using updated history)
            // Rebuild the text for summary from the latest state
             const combinedText = [...chatHistory, userMessage, botMessage]
                .map(msg => `${msg.sender === 'user' ? 'User' : 'Chatbot'}: ${msg.text}`)
                .join('\n');
                
            const sumResponse = await axios.post('http://127.0.0.1:8000/summarize', { text: combinedText });
            // Ensure summary state is updated correctly
             setSummary(sumResponse.data.summary || "");

        } catch (error) {
            console.error('Error sending message:', error.response?.data || error.message);
            toast.error('Error getting response from chatbot.');
            setChatHistory((prev) => [
                ...prev,
                { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' },
            ]);
        } finally {
            setIsSending(false);
        }
    };
     // --- End Chat Submission ---

    // Scroll to bottom effect
     useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    // --- UI Rendering --- 
    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
            {/* Header */} 
            <header className="flex justify-between items-center p-3 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                <h1 className="text-lg font-semibold text-slate-700">
                    WellMind Chatbot
                </h1>
                <Button variant="outline" size="sm" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                </Button>
            </header>

            {/* Chat History Area */}
             <div className="flex-grow overflow-y-auto p-4 space-y-3">
                {/* Initial Bot Message */} 
                 {chatHistory.length === 0 && (
                     <div className="flex justify-start">
                        <div className="max-w-[75%] py-2 px-3 rounded-lg shadow-sm bg-white text-slate-800">
                            <p className="text-sm break-words">
                                Hello! How can I help you today?
                            </p>
                        </div>
                     </div>
                 )}
                 
                {/* Chat Messages */} 
                {chatHistory.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                             className={`max-w-[75%] py-2 px-3 rounded-lg shadow-sm ${msg.sender === 'user' ? 'bg-rose-500 text-white' : 'bg-white text-slate-800'}`}
                        >
                            <p className="text-sm break-words">
                                {msg.text}
                            </p>
                        </div>
                    </div>
                ))}
                 {isSending && ( // Show typing indicator when bot is processing
                     <div className="flex justify-start">
                         <div className="max-w-[75%] py-2 px-3 rounded-lg shadow-sm bg-white text-slate-500 italic">
                             <p className="text-sm break-words">
                                 Typing...
                             </p>
                         </div>
                      </div>
                 )}
                <div ref={messagesEndRef} /> {/* Scroll target */} 
            </div>
            
             {/* Summary Display (Optional - kept simple for now) */} 
             {summary && (
                <div className="px-4 pb-2 text-xs text-slate-600 bg-slate-100 border-t border-b">
                     <details>
                        <summary className="cursor-pointer py-1 font-medium">View Conversation Summary</summary>
                        <pre className="mt-1 p-2 text-xs bg-white rounded border whitespace-pre-wrap max-h-20 overflow-y-auto">
                            {typeof summary === 'object' ? JSON.stringify(summary) : summary}
                        </pre>
                     </details>
                 </div>
             )}

            {/* Input Footer */} 
            <footer className="p-3 border-t bg-white/80 backdrop-blur-sm sticky bottom-0">
                <form 
                    onSubmit={handleSubmit} 
                    className="flex items-center space-x-2"
                >
                    <Input 
                        type="text" 
                        placeholder={listening ? "Listening..." : "Type your message..."}
                        value={input}
                        onChange={(e) => setInput(e.target.value)} 
                        disabled={listening || isSending}
                        autoComplete="off"
                        className="flex-grow"
                    />
                     <Button 
                        type="button"
                        variant={listening ? "destructive" : "outline"}
                        size="icon"
                        onClick={toggleListening}
                        disabled={!recognitionRef.current || isSending}
                        aria-label={listening ? "Stop listening" : "Start voice input"}
                     >
                         {listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                     </Button>
                    <Button 
                        type="submit" 
                        disabled={!input.trim() || isSending || listening} 
                        className="bg-rose-500 hover:bg-rose-600 shrink-0"
                        aria-label="Send message"
                    >
                       {isSending ? <Loader2 className="h-5 w-5 animate-spin"/> : <SendHorizontal className="h-5 w-5" />}
                    </Button>
                </form>
            </footer>
        </div>
    );
};

export default Chatbot;
