
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { User, Send, MessageSquare, Shield } from "lucide-react";
import { toast } from "sonner";
import { ThreeDotsLoading } from "@/components/ui/three-dots-loading";

interface ChatSession {
  id: string;
  userId: string;
  messages: Message[];
  active: boolean;
  timestamp: Date;
  agentId?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot" | "admin";
  timestamp: Date;
}

const mockChatSessions: ChatSession[] = [
  {
    id: "session-1",
    userId: "user-123",
    active: true,
    timestamp: new Date(),
    messages: [
      {
        id: "msg-1",
        text: "I'm having trouble with my streaming subscription",
        sender: "user",
        timestamp: new Date(Date.now() - 300000)
      },
      {
        id: "msg-2",
        text: "I would like to speak with a live support agent.",
        sender: "user",
        timestamp: new Date(Date.now() - 120000)
      },
      {
        id: "msg-3",
        text: "Connecting you with a live support agent. Please wait a moment while we transfer you to the next available representative.",
        sender: "bot",
        timestamp: new Date(Date.now() - 115000)
      }
    ]
  }
];

const AdminChatInterface: React.FC = () => {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(mockChatSessions);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [response, setResponse] = useState("");
  const [joined, setJoined] = useState(false);

  const handleJoinChat = (sessionId: string) => {
    const updatedSessions = chatSessions.map(session => 
      session.id === sessionId ? { ...session, agentId: "admin-1" } : session
    );
    
    setChatSessions(updatedSessions);
    setCurrentSession(updatedSessions.find(s => s.id === sessionId) || null);
    setJoined(true);
    
    toast.success("You've joined the chat session", {
      description: "The customer has been notified that you've joined.",
    });
  };

  const handleSendMessage = () => {
    if (!response.trim() || !currentSession) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: response,
      sender: "admin",
      timestamp: new Date()
    };
    
    const updatedSession = {
      ...currentSession,
      messages: [...currentSession.messages, newMessage]
    };
    
    setChatSessions(prev => 
      prev.map(session => session.id === currentSession.id ? updatedSession : session)
    );
    
    setCurrentSession(updatedSession);
    setResponse("");
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (chatSessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Live Support Requests</h3>
          <p className="text-muted-foreground">
            When customers request live support, their chat sessions will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Live Support Sessions</h2>
        <Badge variant="outline">{chatSessions.length} Active</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-lg font-medium">Waiting for Support</h3>
          
          {chatSessions.map(session => (
            <Card key={session.id} className={session.agentId ? "border-green-500" : "border-yellow-500"}>
              <CardHeader className="p-4 pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>User {session.userId.split('-')[1]}</span>
                  </CardTitle>
                  <Badge variant={session.agentId ? "outline" : "secondary"}>
                    {session.agentId ? "Joined" : "Waiting"}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Started {formatDate(session.timestamp)}
                </p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-sm line-clamp-2 mb-3">
                  {session.messages[session.messages.length - 2]?.text}
                </p>
                <Button 
                  variant={session.agentId ? "outline" : "default"}
                  size="sm" 
                  className="w-full"
                  onClick={() => handleJoinChat(session.id)}
                  disabled={!!session.agentId}
                >
                  {session.agentId ? "Already Joined" : "Join Chat"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="p-4 border-b">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base flex items-center gap-2">
                  {currentSession ? (
                    <>
                      <Shield className="h-4 w-4 text-green-500" />
                      <span>Chat with User {currentSession.userId.split('-')[1]}</span>
                    </>
                  ) : (
                    <span>Select a chat session</span>
                  )}
                </CardTitle>
                {currentSession && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                    Active
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            {currentSession ? (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {currentSession.messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "admin" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] px-3 py-2 rounded-lg ${
                          message.sender === "admin"
                            ? "bg-green-500 text-white"
                            : message.sender === "bot"
                            ? "bg-gray-200"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center mb-1">
                          {message.sender === "admin" ? (
                            <Shield className="h-3 w-3 mr-1" />
                          ) : message.sender === "bot" ? (
                            <MessageSquare className="h-3 w-3 mr-1" />
                          ) : (
                            <User className="h-3 w-3 mr-1" />
                          )}
                          <span className="text-xs opacity-70">
                            {message.sender === "admin" ? "You" : message.sender === "bot" ? "Bot" : "Customer"}
                          </span>
                        </div>
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </div>
                  ))}
                  
                  {!joined && (
                    <div className="flex justify-center py-3">
                      <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 py-2 px-3">
                        <ThreeDotsLoading className="mr-2" />
                        <span>Join this chat to respond</span>
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response..."
                      className="resize-none"
                      disabled={!joined}
                    />
                    <Button className="self-end" disabled={!joined} onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a chat session from the sidebar to begin
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminChatInterface;
