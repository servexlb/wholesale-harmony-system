
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Send, Bot, User, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

// Knowledge base for the chatbot
const botKnowledge = {
  about: {
    keywords: ["about", "company", "who are you", "background", "history", "servexlb"],
    response: "ServexLB is a premier digital services provider based in Beirut, Lebanon. Founded by Salim Hage, we specialize in providing digital load balancing, content distribution, and subscription management services to businesses of all sizes."
  },
  services: {
    keywords: ["services", "products", "offerings", "what do you offer", "what do you sell", "provide"],
    response: "We offer a range of digital services including load balancing, content distribution, managed subscriptions, wholesale distribution, and customized digital solutions for businesses. You can check our Services page for detailed information about each offering."
  },
  pricing: {
    keywords: ["price", "cost", "pricing", "how much", "package", "plan", "subscription cost"],
    response: "Our pricing varies depending on the specific service and your business needs. We offer flexible plans starting from affordable rates for small businesses to enterprise-level solutions. You can check detailed pricing on our Services page, or I can connect you with a team member for a personalized quote."
  },
  contact: {
    keywords: ["contact", "reach", "phone", "email", "address", "location", "office"],
    response: "You can contact us through email at support@servexlb.com, call us at +961 78 991 908, or visit our office located at Beirut Downtown, Martyr's Square, Beirut, Lebanon. Our team is available Monday-Friday, 9AM-6PM EST."
  },
  team: {
    keywords: ["team", "staff", "employees", "experts", "specialists", "who works"],
    response: "ServexLB is led by our founder and CEO Salim Hage, along with a dedicated team of professionals including technical experts, customer support specialists, and industry consultants. Each team member brings valuable expertise to help our clients succeed."
  },
  subscription: {
    keywords: ["subscription", "account", "login", "sign in", "dashboard", "profile"],
    response: "You can manage your subscriptions through your Dashboard after logging in. If you're having issues with your subscription or need assistance, our support team is ready to help."
  },
  support: {
    keywords: ["help", "support", "assistance", "issue", "problem", "trouble", "question"],
    response: "We're here to help! For technical support, you can submit a support ticket through your Dashboard, or contact our support team directly at support@servexlb.com. Our response time is typically within 24 hours."
  },
  refund: {
    keywords: ["refund", "cancel", "money back", "return", "cancellation"],
    response: "We offer refunds within 24 hours of purchase if the service doesn't work as described. For cancellations, please visit your Dashboard. If you need more detailed information about our refund policy, please contact our support team."
  },
  security: {
    keywords: ["security", "privacy", "data", "protection", "secure", "safe"],
    response: "ServexLB takes security and privacy very seriously. We employ industry-standard encryption and security measures to protect your data. For specific questions about our security practices, please contact our technical team."
  },
  wholesale: {
    keywords: ["wholesale", "bulk", "distributor", "reseller", "partner"],
    response: "We offer wholesale solutions for distributors and resellers. Our wholesale platform provides special pricing, bulk ordering capabilities, and dedicated support. If you're interested in becoming a wholesale partner, please contact our sales team."
  },
  faq: {
    keywords: ["faq", "frequently asked", "common questions", "questions"],
    response: "You can find answers to frequently asked questions on our FAQ page. If you don't find what you're looking for, feel free to ask me directly or contact our support team for more assistance."
  },
  payment: {
    keywords: ["payment", "pay", "method", "credit card", "paypal", "checkout"],
    response: "We accept various payment methods including credit cards, PayPal, and bank transfers. All payments are processed securely. If you have any questions about payment options, please reach out to our support team."
  },
  delivery: {
    keywords: ["delivery", "receive", "access", "instant", "download", "get my product"],
    response: "Our digital services are delivered instantly after payment confirmation. You'll receive access credentials via email and can also find them in your account dashboard. If you encounter any delivery issues, please contact our support immediately."
  },
  technical: {
    keywords: ["technical", "specs", "specifications", "requirements", "system", "compatible"],
    response: "Our services are compatible with most modern web browsers and operating systems. For specific technical requirements or compatibility questions, please check the service details page or contact our technical support team."
  }
};

// FAQ list for quick access
const faqList = [
  { question: "What services do you offer?", answer: botKnowledge.services.response },
  { question: "How much do your services cost?", answer: botKnowledge.pricing.response },
  { question: "How can I contact support?", answer: botKnowledge.support.response },
  { question: "What is your refund policy?", answer: botKnowledge.refund.response },
  { question: "How do I access my account?", answer: botKnowledge.subscription.response },
  { question: "Is my data secure?", answer: botKnowledge.security.response }
];

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial bot greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting: Message = {
        id: Date.now().toString(),
        text: "Hi there! I'm ServexLB's virtual assistant. How can I help you today? You can ask about our services, pricing, or select from common questions below.",
        sender: "bot",
        timestamp: new Date()
      };
      setMessages([greeting]);
    }
  }, [isOpen, messages.length]);

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
    }, 800);
  };

  const handleFaqSelect = (question: string, answer: string) => {
    // Add user question
    const userMessage: Message = {
      id: Date.now().toString(),
      text: question,
      sender: "user",
      timestamp: new Date()
    };

    // Add bot answer
    const botMessage: Message = {
      id: Date.now().toString(),
      text: answer,
      sender: "bot",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage, botMessage]);
    
    // Store messages in localStorage for admin
    const chatHistory = JSON.parse(localStorage.getItem("chatMessages") || "[]");
    localStorage.setItem("chatMessages", JSON.stringify([...chatHistory, userMessage]));
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    // Check if the input matches any knowledge base topics
    for (const category in botKnowledge) {
      const topicData = botKnowledge[category as keyof typeof botKnowledge];
      
      if (topicData.keywords.some(keyword => input.includes(keyword))) {
        return topicData.response;
      }
    }
    
    // Check for human/agent requests
    if (input.includes("speak") || input.includes("human") || input.includes("agent") || 
        input.includes("person") || input.includes("team") || input.includes("real person")) {
      return "I'll forward your message to our team. Someone will get back to you soon. Would you like to leave any additional information?";
    }
    
    // Website functionality questions
    if (input.includes("website") || input.includes("site") || input.includes("page") || input.includes("navigation")) {
      return "Our website offers easy navigation to explore our services, learn about our company, contact our team, and access your dashboard. Is there a specific page or feature you're looking for?";
    }
    
    // Technical questions
    if (input.includes("load balancing") || input.includes("cdn") || input.includes("content distribution") || 
        input.includes("how does") || input.includes("technical") || input.includes("technology")) {
      return "Our technical solutions use cutting-edge technology to provide reliable services. For detailed technical information, I recommend checking our Services page or I can connect you with one of our technical specialists.";
    }
    
    // Default response
    return "Thanks for your message. I may not have a specific answer to your question, but our team can assist you. Would you like me to forward your query to a team member who can provide more detailed information?";
  };

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="p-3 border-b flex justify-between items-center bg-primary text-primary-foreground">
        <h3 className="font-medium">ServexLB Support</h3>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsOpen(false)} 
          className="h-6 w-6 text-primary-foreground hover:text-primary-foreground/80"
        >
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
              className={`max-w-[75%] px-3 py-2 rounded-lg ${
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
        
        {/* FAQ section */}
        {messages.length === 1 && (
          <div className="pt-4 pb-2">
            <p className="text-sm font-medium mb-2">Frequently Asked Questions:</p>
            <div className="grid grid-cols-1 gap-2">
              {faqList.map((faq, index) => (
                <button
                  key={index}
                  className="text-left text-xs bg-background border p-2 rounded-md hover:bg-muted transition-colors"
                  onClick={() => handleFaqSelect(faq.question, faq.answer)}
                >
                  {faq.question}
                </button>
              ))}
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

  // Fixed floating button component (not in Sheet)
  const FloatingButton = () => (
    <SheetTrigger asChild>
      <Button
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        size="icon"
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    </SheetTrigger>
  );

  // Mobile: sheet based approach for better mobile experience
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <FloatingButton />
      <SheetContent side="right" className="p-0 w-80 sm:max-w-md">
        <ChatContent />
      </SheetContent>
    </Sheet>
  );
};

export default ChatBot;
