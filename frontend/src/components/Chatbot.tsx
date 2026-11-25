import React, { useState, useRef, useEffect } from 'react';
import { 
  IconButton, 
  Box, 
  Paper, 
  TextField, 
  Typography, 
  Fab, 
  Avatar,
  CircularProgress,
  Button
} from '@mui/material';
import { 
  Chat as ChatIcon, 
  Close as CloseIcon, 
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  actions?: ChatAction[];
}

type ChatAction =
  | { type: 'navigate'; label: string; to: string }
  | { type: 'quick_reply'; label: string; message: string };

interface ChatApiResponse {
  reply: string;
  actions?: ChatAction[];
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const outgoing = inputMessage;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: outgoing,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await api.post<ChatApiResponse>('/chat', { message: outgoing });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.data.reply,
        sender: 'bot',
        timestamp: new Date(),
        actions: response.data.actions || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: error.response?.data?.error || error.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (action: ChatAction) => {
    if (action.type === 'navigate') {
      setIsOpen(false);
      navigate(action.to);
      return;
    }
    if (action.type === 'quick_reply') {
      setInputMessage(action.message);
      // send immediately for better UX
      setTimeout(() => {
        // this uses the current state; the input was set above
        // we intentionally call with the message string for reliability
        const msg = action.message;
        if (!msg.trim()) return;
        const userMessage: Message = {
          id: Date.now().toString(),
          text: msg,
          sender: 'user',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);
        api
          .post<ChatApiResponse>('/chat', { message: msg })
          .then((response) => {
            const botMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: response.data.reply,
              sender: 'bot',
              timestamp: new Date(),
              actions: response.data.actions || [],
            };
            setMessages((prev) => [...prev, botMessage]);
          })
          .catch((error: any) => {
            const errorMessage: Message = {
              id: (Date.now() + 1).toString(),
              text: error.response?.data?.error || error.response?.data?.message || 'Sorry, I encountered an error. Please try again.',
              sender: 'bot',
              timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }, 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        aria-label="chat"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          width: 56,
          height: 56,
          backgroundColor: '#1976d2',
          '&:hover': {
            backgroundColor: '#1565c0'
          }
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Chat Window */}
      {isOpen && (
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 88,
            right: 24,
            width: 380,
            height: 500,
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <BotIcon />
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
              AI Health Assistant
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Messages Container */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              p: 2,
              backgroundColor: '#f5f5f5',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {messages.length === 0 && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: '#666'
                }}
              >
                <BotIcon sx={{ fontSize: 48, mb: 1, color: '#1976d2' }} />
                <Typography variant="body2" align="center">
                  Hello! I'm your AI Health Assistant.
                  <br />
                  How can I help you today?
                </Typography>
              </Box>
            )}

            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    maxWidth: '80%',
                    alignItems: 'flex-start'
                  }}
                >
                  {message.sender === 'bot' && (
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: '#1976d2' }}>
                      <BotIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                  
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      backgroundColor: message.sender === 'user' ? '#1976d2' : 'white',
                      color: message.sender === 'user' ? 'white' : 'black',
                      borderRadius: 2,
                      wordBreak: 'break-word'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {message.text}
                    </Typography>
                    {!!message.actions?.length && (
                      <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {message.actions.map((a, idx) => (
                          <Button
                            key={`${message.id}-action-${idx}`}
                            size="small"
                            variant={a.type === 'navigate' ? 'contained' : 'outlined'}
                            onClick={() => handleAction(a)}
                            sx={{ borderRadius: 999, textTransform: 'none' }}
                          >
                            {a.label}
                          </Button>
                        ))}
                      </Box>
                    )}
                  </Paper>

                  {message.sender === 'user' && (
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: '#4caf50' }}>
                      <PersonIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                  )}
                </Box>
              </Box>
            ))}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                  <Avatar sx={{ width: 32, height: 32, backgroundColor: '#1976d2' }}>
                    <BotIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Paper elevation={1} sx={{ p: 2, backgroundColor: 'white', borderRadius: 2 }}>
                    <CircularProgress size={20} />
                  </Paper>
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              backgroundColor: 'white',
              borderTop: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
              <IconButton
                color="primary"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  },
                  '&.Mui-disabled': {
                    backgroundColor: '#ccc',
                    color: '#999'
                  }
                }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      )}
    </>
  );
};

export default Chatbot;
