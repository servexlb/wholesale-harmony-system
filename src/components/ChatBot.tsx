
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

interface ChatBotProps {
  onClose: () => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial bot greeting
  useEffect(() => {
    const greeting: Message = {
      id: Date.now().toString(),
      text: "Hi there! I'm ServexLB's virtual assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date()
    };
    setMessages([greeting]);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    
    // Show bot is typing
    setIsTyping(true);

    // Store message in localStorage for admin
    const chatHistory = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    localStorage.setItem("chatMessages", JSON.stringify([...chatHistory, userMessage]));

    // Simulate bot response after a short delay
    setTimeout(() => {
      const botResponse = generateBotResponse(input);
      const botMessage: Message = {
        id: Date.now().toString(),
        text: botResponse,
        sender: "bot",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Simple keyword-based responses
    if (input.includes("price") || input.includes("cost") || input.includes("pricing")) {
      return "Our pricing varies depending on the specific service. You can check detailed pricing on our Services page, or I can connect you with a team member for a personalized quote.";
    }
    
    if (input.includes("subscription") || input.includes("account")) {
      return "For specific account or subscription questions, please check your Dashboard. If you need further assistance, I can connect you with our customer support team.";
    }
    
    if (input.includes("refund") || input.includes("cancel")) {
      return "We offer refunds within 24 hours of purchase if the service doesn't work as described. For cancellations, please visit your Dashboard. Need more help?";
    }
    
    if (input.includes("speak") || input.includes("human") || input.includes("agent") || input.includes("person") || input.includes("team")) {
      return "I'll forward your message to our team. Someone will get back to you soon. Would you like to leave any additional information?";
    }
    
    // Default response
    return "Thanks for your message. If you need specific help, our team can assist you. Would you like me to forward your question to them?";
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 bg-background border rounded-lg shadow-lg flex flex-col z-50">
      {/* Chat header */}
      <div className="p-3 border-b flex justify-between items-center bg-primary text-primary-foreground rounded-t-lg">
        <h3 className="font-medium">ServexLB Support</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/80">
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-3/4 px-3 py-2 rounded-lg ${
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === "bot" ? (
                  <Bot className="h-3 w-3 mr-1" />
                ) : (
                  <User className="h-3 w-3 mr-1" />
                )}
                <span className="text-xs opacity-70">
                  {message.sender === "user" ? "You" : "Bot"}
                </span>
              </div>
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-muted px-3 py-2 rounded-lg">
              <div className="flex items-center">
                <Bot className="h-3 w-3 mr-1" />
                <span className="text-xs opacity-70">Bot</span>
              </div>
              <div className="flex space-x-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-3 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default ChatBot;
