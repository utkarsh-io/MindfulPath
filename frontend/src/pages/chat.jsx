// Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { LogOut, SendHorizontal } from "lucide-react";
import toast from "react-hot-toast";

const socket = io("http://localhost:3000");

function Chat() {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { room, role, expert, user, start_time } = location.state || {};
  const messagesEndRef = useRef(null);

  const conv_id = room ? parseInt(room.replace("session_", ""), 10) : null;
  const senderId = role === "expert" ? expert : user;

  useEffect(() => {
    if (!room || !conv_id || !role || !senderId) {
      console.error("Chat component missing required state:", { room, conv_id, role, senderId });
      toast.error("Chat session invalid. Redirecting...");
      const destination = role === 'expert' ? "/expertdashboard" : "/dashboard";
      navigate(destination, { replace: true });
      return;
    }

    socket.emit("joinRoom", room);
    console.log(`User ${senderId} joined room ${room}`);

    const handleChatMessage = (data) => {
      console.log("Message received:", data);
      if (data.sender !== senderId) {
        setChat((prev) => [...prev, data]);
      } else {
        console.log("Received own message back, ignoring for UI update.");
      }
    };
    socket.on("chatMessage", handleChatMessage);

    return () => {
      console.log(`User ${senderId} leaving room ${room}`);
      socket.off("chatMessage", handleChatMessage);
    };
  }, [room, navigate, role, conv_id, senderId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const sendMessage = async () => {
    if (!message.trim() || !conv_id) {
      console.warn("Cannot send empty message or missing conv_id");
      return;
    }

    const messageData = { room, message, sender: senderId };
    
    setChat((prev) => [...prev, messageData]);
    const currentMessage = message;
    setMessage("");
    
    try {
      await axios.post('http://localhost:3000/api/v1/connect/message',
        {
          conversation_id: conv_id,
          message: currentMessage,
          role: role
        },
        { headers: { Authorization: token } }
      );
      socket.emit("chatMessage", messageData);
      console.log("Message sent and saved:", messageData);
    } catch (error) { 
      console.error("Failed to save/send message:", error.response?.data || error.message);
      toast.error("Failed to send message. Please try again.");
      setChat((prev) => prev.filter(msg => !(msg.sender === messageData.sender && msg.message === messageData.message)));
      setMessage(currentMessage);
    }
  };
  
  const backtodash = async () => {
    const toastId = toast.loading("Leaving chat...");
    try {
      socket.emit("chatMessage", {
        room,
        message: `${senderId} has left the chat.`,
        sender: "System"
      });

      let destination = "/";
      if (role === "expert" && start_time && conv_id) {
        destination = "/expertdashboard";
        const now = new Date();
        const startTimeDate = start_time instanceof Date ? start_time : new Date(start_time);
        if (!isNaN(startTimeDate)) {
          const durationSeconds = Math.floor((now - startTimeDate) / 1000);
          console.log("Updating session duration (seconds):", durationSeconds);
          try {
            await axios.put(`http://localhost:3000/api/v1/connect/counselled_by/${conv_id}`, 
              { duration: durationSeconds > 0 ? durationSeconds : 0 },
              { headers: {Authorization: token} }
            );
          } catch (updateError) {
            console.error("Failed to update duration:", updateError.response?.data || updateError.message);
          }
        } else {
          console.error("Invalid start_time for duration calculation:", start_time);
        }
      } else if (role === "user") {
        destination = "/dashboard";
      }

      toast.success("Chat ended.", { id: toastId });
      navigate(destination);

    } catch (error) {
      console.error("Error leaving chat:", error.response?.data || error.message);
      toast.error("Error leaving chat.", { id: toastId });
      const fallbackDestination = role === 'expert' ? "/expertdashboard" : "/dashboard";
      navigate(fallbackDestination);
    }
  };

  const getParticipantName = (pId) => {
    if (role === 'user' && pId === user) return "You";
    if (role === 'expert' && pId === expert) return "You";
    if (pId === user) return `User ${user}`;
    if (pId === expert) return `Expert ${expert}`;
    if (pId === 'System') return 'System';
    return `Unknown (${pId})`;
  };
  
  const chatPartnerName = role === 'user' ? `Expert ${expert}` : `User ${user}`;

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <header className="flex justify-between items-center p-3 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <h1 className="text-lg font-semibold text-slate-700">
          Chat with {chatPartnerName}
        </h1>
        <Button variant="outline" size="sm" onClick={backtodash}>
          <LogOut className="mr-2 h-4 w-4" /> Leave Chat
        </Button>
      </header>

      <div className="flex-grow overflow-y-auto p-4 space-y-3">
        {chat.map((msg, index) => {
          const isCurrentUser = msg.sender === senderId;
          const isSystem = msg.sender === 'System';
          
          if (isSystem) {
            return (
              <div key={index} className="text-center text-xs text-slate-500 italic py-1">
                {msg.message}
              </div>
            );
          }
          
          return (
            <div 
              key={index} 
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[75%] py-2 px-3 rounded-lg shadow-sm ${isCurrentUser ? 'bg-rose-500 text-white' : 'bg-white text-slate-800'}`}
              >
                <p className="text-sm break-words">
                  {msg.message}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <footer className="p-3 border-t bg-white/80 backdrop-blur-sm sticky bottom-0">
        <form 
          onSubmit={(e) => { e.preventDefault(); sendMessage(); }} 
          className="flex items-center space-x-2"
        >
          <Input 
            type="text" 
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)} 
            autoComplete="off"
            className="flex-grow"
          />
          <Button 
            type="submit"
            disabled={!message.trim()} 
            className="bg-rose-500 hover:bg-rose-600 shrink-0"
            aria-label="Send message"
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </form>
      </footer>
    </div>
  );
}

export default Chat;
