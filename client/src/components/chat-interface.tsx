import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, History, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { v4 as uuidv4 } from 'uuid';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

interface Message {
  id: string | number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  userId?: string;
  publicUserId?: string;
  createdAt: string;
  lastActive: string;
}

interface ChatConversation {
  id: string;
  sessionId: string;
  title: string;
  createdAt: string;
}

interface ChatInterfaceProps {
  initialQuestion?: string | null;
}

export default function ChatInterface({ initialQuestion }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [browserFingerprint, setBrowserFingerprint] = useState<string>("");
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user, isAuthenticated, token } = useAuth();

  // Generate a browser fingerprint if one doesn't exist
  useEffect(() => {
    // Try to get browser fingerprint from local storage
    const storedFingerprint = localStorage.getItem('chat_browser_fingerprint');
    
    if (storedFingerprint) {
      console.log('Found existing browser fingerprint in localStorage:', storedFingerprint);
      setBrowserFingerprint(storedFingerprint);
    } else {
      // Generate a new browser fingerprint for anonymous users
      const newFingerprint = uuidv4();
      console.log('Generated new browser fingerprint:', newFingerprint);
      localStorage.setItem('chat_browser_fingerprint', newFingerprint);
      setBrowserFingerprint(newFingerprint);
    }
  }, []);
  
  // Handle user authentication state changes
  useEffect(() => {
    if (isAuthenticated && user?.id && chatSessionId) {
      console.log('User is authenticated - ensuring chat session is linked to user account');
      // When the user logs in, we need to update their session to associate with their account
      // This happens automatically on the server when we send the browser fingerprint
    }
  }, [isAuthenticated, user?.id, chatSessionId]);

  // Create or get a chat session based on browser fingerprint
  const createSessionMutation = useMutation({
    mutationFn: async (browserFingerprint: string) => {
      console.log('Creating/fetching chat session with browser fingerprint:', browserFingerprint);
      const response = await apiRequest(
        "POST",
        "/api/chatbot/session",
        { browserFingerprint },
        token
      );
      return response.json();
    },
    onSuccess: (data) => {
      console.log('Chat session created/fetched successfully:', data.session);
      setChatSessionId(data.session.id);
      
      // Do not load any conversation by default
      // Just show welcome message for all users (logged in and anonymous)
      showWelcomeMessage();
    },
    onError: (error) => {
      console.error('Error creating/fetching chat session:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create chat session. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Create a new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      console.log('Creating new conversation for session:', sessionId);
      const response = await apiRequest(
        "POST",
        "/api/chatbot/conversation",
        { 
          sessionId,
          title: `Agricultural Conversation ${new Date().toLocaleString()}`
        },
        token
      );
      return response.json();
    },
    onSuccess: (data) => {
      console.log('New conversation created:', data.conversation);
      setConversationId(data.conversation.id);
      
      // Close the history dialog if open
      setHistoryDialogOpen(false);
      
      // Don't add a welcome message here since it was already added by showWelcomeMessage
      // And we'll only create a conversation when sending the first message
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create conversation. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Mutation to fetch messages (used for verification)
  const getChatMessagesMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      console.log('Verifying conversation exists by fetching messages:', conversationId);
      const response = await apiRequest(
        "GET",
        `/api/chatbot/messages/${conversationId}`,
        undefined,
        token
      );
      return response.json();
    }
  });
  
  // Helper function to fetch user conversations
  const fetchUserConversations = async (): Promise<ChatConversation[]> => {
    if (!isAuthenticated || !user?.id || !token) return [];
    
    try {
      console.log('Directly fetching conversations for authenticated user');
      const response = await apiRequest(
        "GET",
        "/api/chatbot/user-conversations",
        undefined,
        token
      );
      
      const data = await response.json();
      console.log(`Fetched ${data.conversations?.length || 0} conversations directly`);
      return data.conversations || [];
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      return [];
    }
  };
  
  // Fetch user's conversations if logged in (for UI)
  const fetchUserConversationsQuery = useQuery<{ conversations: ChatConversation[] }>({
    queryKey: ['userConversations'],
    queryFn: async () => {
      if (!isAuthenticated || !user?.id || !token) return { conversations: [] };
      console.log('Fetching conversations for authenticated user with token');
      const response = await apiRequest(
        "GET",
        "/api/chatbot/user-conversations",
        undefined,
        token
      );
      
      const data = await response.json();
      console.log(`Received ${data.conversations?.length || 0} conversations from server`);
      
      // If no conversations were found but user is authenticated, refetch to trigger 
      // the creation of a default conversation on the server
      if ((!data.conversations || data.conversations.length === 0) && isAuthenticated) {
        console.log('No conversations found for authenticated user, will create one automatically');
      }
      
      return data;
    },
    enabled: !!isAuthenticated && !!user?.id && !!token,
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true
  });
  
  // Fetch message history when conversation ID changes
  const fetchMessagesQuery = useQuery({
    queryKey: ['chatMessages', conversationId],
    queryFn: async () => {
      if (!conversationId) return { messages: [] };
      console.log('Fetching messages for conversation:', conversationId);
      const response = await apiRequest(
        "GET",
        `/api/chatbot/messages/${conversationId}`,
        undefined,
        token
      );
      return response.json();
    },
    enabled: !!conversationId
  });
  
  // Process messages when they arrive
  useEffect(() => {
    if (!fetchMessagesQuery.data) return;
    
    const data = fetchMessagesQuery.data;
    if (data?.messages?.length > 0) {
      console.log(`Received ${data.messages.length} messages from server`);
      
      // Set the messages from the database, preserving the welcome message if it exists
      const welcomeMessage = messages.find(msg => msg.id === "welcome");
      const messagesToSet = data.messages.map((msg: { id: string, content: string, role: 'user' | 'assistant', createdAt: string }) => ({
        ...msg,
        timestamp: new Date(msg.createdAt)
      }));
      
      if (welcomeMessage && messagesToSet.length > 0) {
        // If we have both a welcome message and history from DB, combine them
        setMessages([welcomeMessage, ...messagesToSet]);
      } else if (messagesToSet.length > 0) {
        // If we only have history from DB, just use that
        setMessages(messagesToSet);
      }
      // If we only have a welcome message and no history, keep what we have
      
      // Mark as initialized once we've processed messages
      setIsInitialized(true);
    } else if (!isInitialized && data?.messages?.length === 0) {
      // No messages in database, but we've checked - mark as initialized
      setIsInitialized(true);
      
      // If we don't have any messages, make sure we show a welcome message
      if (messages.length === 0) {
        showWelcomeMessage();
      }
    }
  }, [fetchMessagesQuery.data]);

  // Initialize the chat session and conversation
  useEffect(() => {
    if (browserFingerprint && !chatSessionId) {
      console.log('Initializing chat with browser fingerprint:', browserFingerprint);
      createSessionMutation.mutate(browserFingerprint);
    }
  }, [browserFingerprint]);

  // Helper function to show welcome message without creating a conversation
  const showWelcomeMessage = () => {
    const welcomeMessage = isAuthenticated && user?.username
      ? `Hello ${user.username}! I'm Agri Assistant, your farming expert. How can I help you today? You can ask me about crop diseases, farming techniques, market trends, or weather conditions.`
      : "Hello! I'm Agri Assistant, your farming expert. How can I help you today? You can ask me about crop diseases, farming techniques, market trends, or weather conditions.";
    
    console.log('Showing welcome message');
    setMessages([
      {
        id: "welcome",
        content: welcomeMessage,
        role: "assistant",
        timestamp: new Date(),
      },
    ]);
    
    // Handle initial question if provided
    if (initialQuestion) {
      console.log('Initial question provided, handling:', initialQuestion);
      setTimeout(() => {
        handleSendMessage(initialQuestion);
      }, 500);
    }
  };
  
  // Helper function to create a new conversation UI (without server calls)
  const startNewConversation = () => {
    console.log('Starting new conversation UI');
    // Reset conversation state but keep session
    setConversationId(null);
    setMessages([]);
    showWelcomeMessage();
  };
  
  // Helper function to handle initial question (creates conversation when needed)
  const handleInitialQuestion = (question: string) => {
    if (!chatSessionId) return;
    
    // We need to create a conversation first since this is the initial question
    createConversationMutation.mutate(chatSessionId, {
      onSuccess: (data) => {
        // Now send the message with the new conversation ID
        handleSendMessage(question);
      }
    });
  };
  
  // Scroll to bottom of chat when messages update
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  const sendMessageMutation = useMutation({
    mutationFn: async ({conversationId, message}: {conversationId: string, message: string}) => {
      if (!conversationId) {
        throw new Error("No active conversation");
      }
      
      const response = await apiRequest(
        "POST", 
        "/api/chatbot/message", 
        { 
          conversationId,
          message 
        },
        token
      );
      return response.json();
    },
    onSuccess: (data) => {
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [
          ...prev, 
          {
            id: `bot-${Date.now()}`,
            content: data.message,
            role: 'assistant',
            timestamp: new Date(),
          }
        ]);
      }, 1000); // Simulate typing delay
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    // Add user message to chat immediately for better UX
    setMessages(prev => [
      ...prev, 
      {
        id: `user-${Date.now()}`,
        content: message,
        role: 'user',
        timestamp: new Date(),
      }
    ]);
    
    // Show bot typing indicator
    setIsTyping(true);
    
    // We need to handle three cases:
    // 1. No session ID - create a session first, then create a conversation, then send the message
    // 2. Session ID exists but no conversation ID - create a conversation first, then send the message
    // 3. Both session ID and conversation ID exist - send the message directly
    
    if (!chatSessionId) {
      // Case 1: No session ID yet
      if (browserFingerprint) {
        console.log('No session ID, creating session first with fingerprint:', browserFingerprint);
        createSessionMutation.mutate(browserFingerprint, {
          onSuccess: (sessionData) => {
            // Now create a conversation with the new session ID
            console.log('Session created, now creating conversation');
            createConversationMutation.mutate(sessionData.session.id, {
              onSuccess: (convData) => {
                // Now we have both session and conversation, send the message
                sendMessageMutation.mutate({ conversationId: convData.conversation.id, message });
              },
              onError: (error) => {
                setIsTyping(false);
                toast({
                  title: "Error",
                  description: "Failed to create conversation. Please try again.",
                  variant: "destructive"
                });
              }
            });
          },
          onError: (error) => {
            setIsTyping(false);
            toast({
              title: "Error",
              description: "Failed to initialize chat. Please refresh and try again.",
              variant: "destructive"
            });
          }
        });
      } else {
        // No browser fingerprint yet, can't proceed
        setIsTyping(false);
        toast({
          title: "Error",
          description: "Chat session not initialized. Please refresh the page.",
          variant: "destructive"
        });
      }
    } else if (!conversationId) {
      // Case 2: Has session ID but no conversation ID
      console.log('Creating new conversation before sending first message');
      createConversationMutation.mutate(chatSessionId, {
        onSuccess: (data) => {
          // Now send the message with the new conversation ID
          sendMessageMutation.mutate({conversationId: data.conversation.id, message});
        },
        onError: (error) => {
          setIsTyping(false);
          toast({
            title: "Error",
            description: "Failed to create conversation. Please try again.",
            variant: "destructive"
          });
        }
      });
    } else {
      // Case 3: Already has both session ID and conversation ID
      sendMessageMutation.mutate({conversationId, message});
    }
    
    // Reset input
    setInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(input);
    }
  };
  
  // State to control the dialog
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  
  // Switch to a different conversation
  const switchConversation = async (conversationId: string) => {
    try {
      // Update the active conversation ID
      setConversationId(conversationId);
      
      // Clear current messages to avoid showing old messages before new ones load
      setMessages([]);
      
      // Close the history dialog
      setHistoryDialogOpen(false);
      
      // Immediately fetch messages for the selected conversation
      try {
        const response = await apiRequest(
          "GET",
          `/api/chatbot/messages/${conversationId}`,
          undefined,
          token
        );
        const data = await response.json();
        
        if (data?.messages?.length > 0) {
          const messagesToSet = data.messages.map((msg: { id: string, content: string, role: 'user' | 'assistant', createdAt: string }) => ({
            ...msg,
            timestamp: new Date(msg.createdAt)
          }));
          setMessages(messagesToSet);
        }
      } catch (fetchError) {
        console.error('Error fetching messages for conversation:', fetchError);
      }
      
      // Notify user
      toast({
        title: "Conversation Loaded",
        description: "Switched to your selected conversation",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversation. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Format conversation date
  const formatConversationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-neutral-100">
      {/* Chat Header */}
      <div className="bg-[#8BC34A] text-white p-4 flex items-center justify-between">
        <div className="flex items-center">
          <i className="fas fa-robot text-2xl mr-3"></i>
          <div>
            <h3 className="font-heading font-bold text-lg">Agri Assistant</h3>
            <div className="text-xs opacity-80">Online | Instant Farming Expertise</div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Chat History Button - Only for logged in users */}
          {isAuthenticated && user && (
            <Dialog open={historyDialogOpen} onOpenChange={setHistoryDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-[#7CB342] text-white border-none hover:bg-[#689F38] p-2"
                  onClick={() => setHistoryDialogOpen(true)}
                >
                  <History className="h-4 w-4 mr-1" />
                  <span className="text-xs">History</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Your Chat History</DialogTitle>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto">
                  {fetchUserConversationsQuery.isLoading ? (
                    <div className="flex justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-[#8BC34A]" />
                    </div>
                  ) : fetchUserConversationsQuery.data && 'conversations' in fetchUserConversationsQuery.data &&
                    fetchUserConversationsQuery.data.conversations &&
                    fetchUserConversationsQuery.data.conversations.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {(fetchUserConversationsQuery.data.conversations as ChatConversation[]).map((conversation: ChatConversation) => (
                        <div
                          key={conversation.id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            conversation.id === conversationId 
                              ? 'bg-[#f1f8e9] border-[#8BC34A]' 
                              : 'bg-white hover:bg-neutral-50'
                          }`}
                          onClick={() => {
                            switchConversation(conversation.id);
                          }}
                        >
                          <div className="font-medium text-sm">{conversation.title}</div>
                          <div className="text-xs text-neutral-500">{formatConversationDate(conversation.createdAt)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-neutral-500">
                      No previous conversations found.
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Just reset UI state for a new conversation
                      // First ensure we have a session ID
                      if (!chatSessionId && browserFingerprint) {
                        console.log('No session ID, creating new session first...');
                        createSessionMutation.mutate(browserFingerprint, {
                          onSuccess: (data) => {
                            setChatSessionId(data.session.id);
                            startNewConversation();
                          }
                        });
                      } else {
                        // We already have a session ID, just reset conversation state
                        startNewConversation();
                      }

                      setHistoryDialogOpen(false);
                      toast({
                        title: "New Conversation",
                        description: "Started a new conversation. Send a message to begin!",
                      });
                    }}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    New Conversation
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setHistoryDialogOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      {/* Public user notice */}
      {!isAuthenticated && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 text-sm">
          <p className="font-medium text-blue-700">You're chatting as a guest</p>
          <p className="text-blue-600">Sign in to save your conversations and access chat history.</p>
        </div>
      )}
      
      {/* Chat Messages */}
      <div 
        ref={chatContainerRef}
        className="h-96 overflow-y-auto p-4 bg-neutral-50"
      >
        <div className="flex flex-col space-y-4">
          {messages.map((message) => (
            message.role === 'assistant' ? (
              <div key={message.id} className="flex items-start space-x-2 max-w-[75%]">
                <div className="w-8 h-8 rounded-full bg-[#8BC34A] flex items-center justify-center text-white">
                  <i className="fas fa-robot"></i>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                  <div className="text-neutral-800 prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-xs text-neutral-400 mt-1 block">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex items-start justify-end space-x-2 max-w-[75%] self-end">
                <div className="bg-primary-500 p-3 rounded-lg shadow-sm text-white">
                  <div className="prose-sm max-w-none text-white">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  </div>
                  <span className="text-xs text-white opacity-80 mt-1 block">
                    {formatTimestamp(message.timestamp)}
                  </span>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white">
                  <i className="fas fa-user"></i>
                </div>
              </div>
            )
          ))}
          
          {/* Bot Typing Indicator */}
          {isTyping && (
            <div className="flex items-start space-x-2 max-w-[75%]">
              <div className="w-8 h-8 rounded-full bg-[#8BC34A] flex items-center justify-center text-white">
                <i className="fas fa-robot"></i>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse delay-75"></div>
                  <div className="w-2 h-2 bg-neutral-400 rounded-full animate-pulse delay-150"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Chat Input */}
      <div className="p-4 border-t">
        <div className="flex items-center">
          <div className="flex-grow">
            <Input
              type="text"
              placeholder="Ask Agri Assistant a question..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full px-4 py-2 border border-neutral-200 focus:ring-[#8BC34A] focus:border-[#8BC34A]"
            />
          </div>
          <Button
            onClick={() => handleSendMessage(input)}
            disabled={!input.trim() || isTyping}
            className="ml-2 p-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition"
          >
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-send">
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </Button>
        </div>
        <div className="mt-2 text-sm text-neutral-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8BC34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-lightbulb mr-2">
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          <span>Try asking about <strong>crop diseases</strong>, <strong>soil health</strong>, <strong>sustainable farming</strong>, or <strong>market trends</strong></span>
        </div>
      </div>
    </div>
  );
}