import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Fab,
  Drawer,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Button,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  ChatBubble,
  Close,
  ShoppingCart,
  Search,
  LocalShipping,
  Help,
  SmartToy,
  Person,
  Mic,
  MicOff,
  Image,
  AttachFile,
  MoreVert,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';

// Message types
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  attachments?: {
    type: 'image' | 'file' | 'product';
    url: string;
    name: string;
    id?: string;
    price?: number;
  }[];
  suggestedResponses?: string[];
  isLoading?: boolean;
  isError?: boolean;
}

// Suggested queries for quick access
const suggestedQueries = [
  { text: '¿Cómo puedo rastrear mi pedido?', icon: <LocalShipping fontSize="small" /> },
  { text: '¿Cuál es la política de devoluciones?', icon: <Help fontSize="small" /> },
  { text: 'Buscar productos de Apple', icon: <Search fontSize="small" /> },
  { text: 'Ayuda con mi compra', icon: <ShoppingCart fontSize="small" /> },
];

interface ChatAssistantProps {
  userName?: string;
  userAvatar?: string;
  onProductSearch?: (query: string) => void;
  onProductView?: (productId: string) => void;
  onOrderTrack?: (orderId: string) => void;
}

/**
 * AI-powered chat assistant component
 */
const ChatAssistant: React.FC<ChatAssistantProps> = ({
  userName = 'Usuario',
  userAvatar,
  onProductSearch,
  onProductView,
  onOrderTrack,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Initialize chat with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          text: `¡Hola${userName ? ` ${userName}` : ''}! Soy el asistente virtual de PlataMX. ¿En qué puedo ayudarte hoy?`,
          sender: 'assistant',
          timestamp: new Date(),
          suggestedResponses: [
            '¿Cuáles son las ofertas del día?',
            'Quiero rastrear mi pedido',
            'Necesito ayuda con una devolución',
          ],
        },
      ]);
    }
  }, [userName, messages.length]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Toggle chat open/closed
  const toggleChat = () => {
    setOpen(!open);
  };
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
  
  // Handle sending a message
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    
    // Add loading message from assistant
    const loadingMessage: Message = {
      id: `assistant-${Date.now()}`,
      text: '',
      sender: 'assistant',
      timestamp: new Date(),
      isLoading: true,
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    // Simulate AI response after a delay
    setTimeout(() => {
      // Remove loading message
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      // Add AI response
      const aiResponse = generateMockResponse(input);
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };
  
  // Handle pressing Enter to send
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Handle clicking a suggested response
  const handleSuggestedResponse = (response: string) => {
    setInput(response);
    
    // Focus the input field
    const inputField = document.getElementById('chat-input');
    if (inputField) {
      inputField.focus();
    }
  };
  
  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real implementation, you would upload the file to your server
    // For this example, we'll just add a message with the file name
    
    const file = files[0];
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: '',
      sender: 'user',
      timestamp: new Date(),
      attachments: [
        {
          type: 'file',
          url: URL.createObjectURL(file),
          name: file.name,
        },
      ],
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: `assistant-${Date.now()}`,
        text: `He recibido tu archivo "${file.name}". ¿En qué puedo ayudarte con este documento?`,
        sender: 'assistant',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 1500);
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // In a real implementation, you would upload the image to your server
    // For this example, we'll just add a message with the image
    
    const file = files[0];
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: '',
      sender: 'user',
      timestamp: new Date(),
      attachments: [
        {
          type: 'image',
          url: URL.createObjectURL(file),
          name: file.name,
        },
      ],
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Reset the image input
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
    
    // Simulate AI response for image search
    setTimeout(() => {
      const aiResponse: Message = {
        id: `assistant-${Date.now()}`,
        text: 'He encontrado algunos productos similares a la imagen que compartiste:',
        sender: 'assistant',
        timestamp: new Date(),
        attachments: [
          {
            type: 'product',
            url: '/images/products/smartphone.jpg',
            name: 'Smartphone Galaxy S21',
            id: 'p1',
            price: 14999,
          },
          {
            type: 'product',
            url: '/images/products/smartphone2.jpg',
            name: 'iPhone 13 Pro',
            id: 'p2',
            price: 19999,
          },
        ],
      };
      
      setMessages(prev => [...prev, aiResponse]);
    }, 2000);
  };
  
  // Toggle voice recording
  const toggleRecording = () => {
    // In a real implementation, you would use the Web Speech API
    // For this example, we'll just toggle the state
    
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      // Start recording
      // This would use the Web Speech API in a real implementation
      
      // Simulate typing indicator
      setIsTyping(true);
      
      // Simulate recording for 3 seconds
      setTimeout(() => {
        setIsRecording(false);
        setIsTyping(false);
        
        // Add a mock transcribed message
        const transcribedText = '¿Cuáles son las ofertas del día?';
        setInput(transcribedText);
        
        // Focus the input field
        const inputField = document.getElementById('chat-input');
        if (inputField) {
          inputField.focus();
        }
      }, 3000);
    } else {
      // Stop recording
      setIsTyping(false);
    }
  };
  
  // Handle product click
  const handleProductClick = (productId: string) => {
    if (onProductView) {
      onProductView(productId);
    }
    
    // Close the chat
    setOpen(false);
  };
  
  // Format timestamp
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Generate a mock response based on the user's input
  const generateMockResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    // Check for product search
    if (input.includes('buscar') || input.includes('encontrar') || input.includes('productos')) {
      if (onProductSearch) {
        onProductSearch(userInput);
      }
      
      return {
        id: `assistant-${Date.now()}`,
        text: 'He encontrado estos productos que podrían interesarte:',
        sender: 'assistant',
        timestamp: new Date(),
        attachments: [
          {
            type: 'product',
            url: '/images/products/laptop.jpg',
            name: 'Laptop Lenovo ThinkPad X1',
            id: 'p3',
            price: 24999,
          },
          {
            type: 'product',
            url: '/images/products/headphones.jpg',
            name: 'Audífonos Sony WH-1000XM4',
            id: 'p4',
            price: 6999,
          },
        ],
        suggestedResponses: [
          'Muéstrame más productos',
          '¿Cuál es el mejor?',
          'Buscar por precio más bajo',
        ],
      };
    }
    
    // Check for order tracking
    if (input.includes('pedido') || input.includes('orden') || input.includes('rastrear') || input.includes('seguimiento')) {
      if (onOrderTrack) {
        onOrderTrack('ORD-12345');
      }
      
      return {
        id: `assistant-${Date.now()}`,
        text: 'Tu pedido #ORD-12345 está en camino. Fue enviado ayer y se espera que llegue en 2 días. ¿Necesitas más detalles sobre este pedido?',
        sender: 'assistant',
        timestamp: new Date(),
        suggestedResponses: [
          'Sí, quiero más detalles',
          '¿Puedo cambiar la dirección de entrega?',
          'Gracias, eso es todo',
        ],
      };
    }
    
    // Check for return policy
    if (input.includes('devolver') || input.includes('devolución') || input.includes('reembolso')) {
      return {
        id: `assistant-${Date.now()}`,
        text: 'Nuestra política de devoluciones permite devolver productos dentro de los 30 días posteriores a la compra. Puedes iniciar una devolución desde tu cuenta en la sección "Mis pedidos". ¿Necesitas ayuda para iniciar una devolución?',
        sender: 'assistant',
        timestamp: new Date(),
        suggestedResponses: [
          'Sí, quiero iniciar una devolución',
          '¿Cuál es el costo de envío para devoluciones?',
          'No, gracias',
        ],
      };
    }
    
    // Check for offers
    if (input.includes('oferta') || input.includes('descuento') || input.includes('promoción')) {
      return {
        id: `assistant-${Date.now()}`,
        text: 'Tenemos varias ofertas activas en este momento. Las más destacadas son:',
        sender: 'assistant',
        timestamp: new Date(),
        attachments: [
          {
            type: 'product',
            url: '/images/products/smartwatch.jpg',
            name: 'Smartwatch Apple Watch Series 7',
            id: 'p5',
            price: 8999,
          },
          {
            type: 'product',
            url: '/images/products/camera.jpg',
            name: 'Cámara Sony Alpha A7 III',
            id: 'p6',
            price: 34999,
          },
        ],
        suggestedResponses: [
          'Ver todas las ofertas',
          '¿Hay ofertas en electrónicos?',
          'Gracias',
        ],
      };
    }
    
    // Default response
    return {
      id: `assistant-${Date.now()}`,
      text: 'Gracias por tu mensaje. ¿En qué más puedo ayudarte hoy?',
      sender: 'assistant',
      timestamp: new Date(),
      suggestedResponses: [
        'Buscar productos',
        'Ver ofertas del día',
        'Rastrear mi pedido',
      ],
    };
  };
  
  return (
    <>
      {/* Chat button */}
      <Tooltip title={open ? 'Cerrar chat' : 'Abrir chat'}>
        <Fab
          color="primary"
          aria-label={open ? 'Cerrar chat' : 'Abrir chat'}
          onClick={toggleChat}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
          }}
        >
          {open ? <Close /> : <ChatBubble />}
        </Fab>
      </Tooltip>
      
      {/* Chat drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: isMobile ? '100%' : 400,
            height: isMobile ? '100%' : 'calc(100% - 100px)',
            bottom: isMobile ? 0 : 50,
            top: isMobile ? 0 : 'auto',
            borderTopLeftRadius: isMobile ? 0 : 16,
            borderBottomLeftRadius: isMobile ? 0 : 16,
          },
        }}
      >
        {/* Chat header */}
        <Box
          sx={{
            p: 2,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
              <SmartToy />
            </Avatar>
            <Box>
              <Typography variant="subtitle1">
                Asistente PlataMX
              </Typography>
              <Typography variant="caption">
                Disponible 24/7
              </Typography>
            </Box>
          </Box>
          <IconButton color="inherit" onClick={() => setOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        
        {/* Suggested queries */}
        <Box sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="subtitle2" gutterBottom>
            Preguntas frecuentes
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {suggestedQueries.map((query, index) => (
              <Chip
                key={index}
                icon={query.icon}
                label={query.text}
                onClick={() => handleSuggestedResponse(query.text)}
                clickable
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Box>
        
        <Divider />
        
        {/* Chat messages */}
        <Box
          sx={{
            p: 2,
            flexGrow: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <List sx={{ width: '100%', p: 0 }}>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                alignItems="flex-start"
                sx={{
                  flexDirection: message.sender === 'user' ? 'row-reverse' : 'row',
                  px: 0,
                  py: 1,
                }}
              >
                <ListItemAvatar sx={{ minWidth: 40 }}>
                  {message.sender === 'user' ? (
                    userAvatar ? (
                      <Avatar src={userAvatar} alt={userName} />
                    ) : (
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <Person />
                      </Avatar>
                    )
                  ) : (
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      <SmartToy />
                    </Avatar>
                  )}
                </ListItemAvatar>
                
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%',
                        ml: message.sender === 'user' ? 'auto' : 0,
                        mr: message.sender === 'user' ? 0 : 'auto',
                      }}
                    >
                      {/* Message bubble */}
                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor: message.sender === 'user' ? 'primary.main' : 'background.paper',
                          color: message.sender === 'user' ? 'primary.contrastText' : 'text.primary',
                          borderRadius: 2,
                          borderTopRightRadius: message.sender === 'user' ? 0 : 2,
                          borderTopLeftRadius: message.sender === 'user' ? 2 : 0,
                          position: 'relative',
                          wordBreak: 'break-word',
                        }}
                      >
                        {/* Loading indicator */}
                        {message.isLoading ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={20} />
                            <Typography variant="body2">Escribiendo...</Typography>
                          </Box>
                        ) : (
                          <>
                            {/* Message text */}
                            {message.text && (
                              <Typography variant="body1">
                                {message.text}
                              </Typography>
                            )}
                            
                            {/* Attachments */}
                            {message.attachments && message.attachments.length > 0 && (
                              <Box sx={{ mt: message.text ? 2 : 0 }}>
                                {message.attachments.map((attachment, index) => (
                                  <Box key={index} sx={{ mt: index > 0 ? 2 : 0 }}>
                                    {attachment.type === 'image' && (
                                      <Box
                                        component="img"
                                        src={attachment.url}
                                        alt={attachment.name}
                                        sx={{
                                          maxWidth: '100%',
                                          maxHeight: 200,
                                          borderRadius: 1,
                                        }}
                                      />
                                    )}
                                    
                                    {attachment.type === 'file' && (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          p: 1,
                                          border: 1,
                                          borderColor: 'divider',
                                          borderRadius: 1,
                                        }}
                                      >
                                        <AttachFile sx={{ mr: 1 }} />
                                        <Typography variant="body2" noWrap>
                                          {attachment.name}
                                        </Typography>
                                      </Box>
                                    )}
                                    
                                    {attachment.type === 'product' && (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          border: 1,
                                          borderColor: 'divider',
                                          borderRadius: 1,
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() => attachment.id && handleProductClick(attachment.id)}
                                      >
                                        <Box
                                          component="img"
                                          src={attachment.url}
                                          alt={attachment.name}
                                          sx={{
                                            width: 80,
                                            height: 80,
                                            objectFit: 'cover',
                                          }}
                                        />
                                        <Box sx={{ p: 1, flexGrow: 1 }}>
                                          <Typography variant="subtitle2" noWrap>
                                            {attachment.name}
                                          </Typography>
                                          {attachment.price && (
                                            <Typography variant="body2" color="primary" fontWeight="bold">
                                              ${attachment.price.toFixed(2)}
                                            </Typography>
                                          )}
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            sx={{ mt: 0.5 }}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Handle add to cart
                                            }}
                                          >
                                            Ver detalles
                                          </Button>
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>
                                ))}
                              </Box>
                            )}
                          </>
                        )}
                        
                        {/* Timestamp */}
                        <Typography
                          variant="caption"
                          sx={{
                            position: 'absolute',
                            bottom: 4,
                            right: message.sender === 'user' ? 'auto' : 4,
                            left: message.sender === 'user' ? 4 : 'auto',
                            color: message.sender === 'user' ? 'rgba(255,255,255,0.7)' : 'text.secondary',
                          }}
                        >
                          {formatTimestamp(message.timestamp)}
                        </Typography>
                      </Paper>
                      
                      {/* Feedback buttons for assistant messages */}
                      {message.sender === 'assistant' && !message.isLoading && (
                        <Box sx={{ display: 'flex', mt: 0.5, gap: 1 }}>
                          <Tooltip title="Útil">
                            <IconButton size="small">
                              <ThumbUp fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="No útil">
                            <IconButton size="small">
                              <ThumbDown fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      
                      {/* Suggested responses */}
                      {message.sender === 'assistant' && message.suggestedResponses && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, maxWidth: '100%' }}>
                          {message.suggestedResponses.map((response, index) => (
                            <Chip
                              key={index}
                              label={response}
                              onClick={() => handleSuggestedResponse(response)}
                              clickable
                              size="small"
                              sx={{ maxWidth: '100%' }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          
          {/* Typing indicator */}
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                <SmartToy fontSize="small" />
              </Avatar>
              <Paper
                elevation={1}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  borderTopLeftRadius: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'text.secondary',
                      animation: 'pulse 1s infinite',
                      animationDelay: '0s',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          opacity: 0.5,
                        },
                        '50%': {
                          opacity: 1,
                        },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'text.secondary',
                      animation: 'pulse 1s infinite',
                      animationDelay: '0.2s',
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: 'text.secondary',
                      animation: 'pulse 1s infinite',
                      animationDelay: '0.4s',
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          )}
          
          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </Box>
        
        <Divider />
        
        {/* Chat input */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          {/* File upload button */}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <Tooltip title="Adjuntar archivo">
            <IconButton
              color="primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <AttachFile />
            </IconButton>
          </Tooltip>
          
          {/* Image upload button */}
          <input
            type="file"
            accept="image/*"
            ref={imageInputRef}
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
          <Tooltip title="Buscar por imagen">
            <IconButton
              color="primary"
              onClick={() => imageInputRef.current?.click()}
            >
              <Image />
            </IconButton>
          </Tooltip>
          
          {/* Voice input button */}
          <Tooltip title={isRecording ? "Detener grabación" : "Buscar por voz"}>
            <IconButton
              color={isRecording ? "error" : "primary"}
              onClick={toggleRecording}
            >
              {isRecording ? <MicOff /> : <Mic />}
            </IconButton>
          </Tooltip>
          
          {/* Text input */}
          <TextField
            id="chat-input"
            placeholder="Escribe tu mensaje..."
            variant="outlined"
            fullWidth
            size="small"
            value={input}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            disabled={isRecording}
            InputProps={{
              endAdornment: (
                <IconButton
                  color="primary"
                  onClick={handleSendMessage}
                  disabled={input.trim() === '' || isRecording}
                >
                  <Send />
                </IconButton>
              ),
            }}
          />
        </Box>
      </Drawer>
    </>
  );
};

export default ChatAssistant;