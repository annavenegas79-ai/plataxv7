import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot,
  User,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  Info,
  HelpCircle,
  MessageSquare,
  X,
  Minimize2,
  Maximize2,
  Star,
  ShoppingCart,
  Heart,
  Search,
  MapPin
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai' | 'agent';
  message: string;
  timestamp: string;
  intent?: string;
  entities?: any;
  confidence?: number;
  suggestions?: string[];
  productRecommendations?: Array<{
    id: number;
    title: string;
    price: string;
    image: string;
  }>;
  quickActions?: Array<{
    label: string;
    action: string;
    icon?: string;
  }>;
}

interface ChatSession {
  id: number;
  sessionToken: string;
  status: 'active' | 'ended' | 'escalated';
  language: string;
  createdAt: string;
}

interface VoiceState {
  isRecording: boolean;
  isPlaying: boolean;
  isSupported: boolean;
}

interface AiChatbotProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
}

export function AiChatbot({ 
  isMinimized = false, 
  onToggleMinimize, 
  onClose 
}: AiChatbotProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Chat state
  const [currentMessage, setCurrentMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isPlaying: false,
    isSupported: ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && 'speechSynthesis' in window
  });
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Current chat session query
  const { data: chatSession, isLoading: sessionLoading } = useQuery<ChatSession>({
    queryKey: ['/api/chat/session'],
    staleTime: Infinity, // Keep session alive
  });
  
  // Chat messages query
  const { data: messages = [], isLoading: messagesLoading, refetch: refetchMessages } = useQuery<ChatMessage[]>({
    queryKey: ['/api/chat/messages', chatSession?.sessionToken],
    enabled: !!chatSession?.sessionToken,
    refetchInterval: 5000, // Poll for new messages
  });
  
  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, sessionToken }: { message: string; sessionToken: string }) => {
      return apiRequest('POST', '/api/chat/send', {
        message,
        sessionToken,
        sender: 'user'
      });
    },
    onMutate: () => {
      setIsTyping(true);
    },
    onSuccess: () => {
      setCurrentMessage('');
      refetchMessages();
      setTimeout(() => setIsTyping(false), 1000);
    },
    onError: () => {
      setIsTyping(false);
      toast({
        title: "Error al enviar mensaje",
        description: "No se pudo enviar el mensaje. Intenta nuevamente.",
        variant: "destructive",
      });
    }
  });
  
  // Initialize speech recognition
  useEffect(() => {
    if (voiceState.isSupported) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'es-MX';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setCurrentMessage(transcript);
        setVoiceState(prev => ({ ...prev, isRecording: false }));
      };
      
      recognitionRef.current.onend = () => {
        setVoiceState(prev => ({ ...prev, isRecording: false }));
      };
      
      recognitionRef.current.onerror = () => {
        setVoiceState(prev => ({ ...prev, isRecording: false }));
        toast({
          title: "Error de reconocimiento de voz",
          description: "No se pudo procesar el audio.",
          variant: "destructive",
        });
      };
    }
  }, [voiceState.isSupported, toast]);
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when not minimized
  useEffect(() => {
    if (!isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isMinimized]);
  
  // Handle send message
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !chatSession?.sessionToken || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate({ 
      message: currentMessage.trim(), 
      sessionToken: chatSession.sessionToken 
    });
  };
  
  // Handle voice recording
  const toggleVoiceRecording = () => {
    if (!voiceState.isSupported) {
      toast({
        title: "Función no disponible",
        description: "Tu navegador no soporta reconocimiento de voz.",
        variant: "destructive",
      });
      return;
    }
    
    if (voiceState.isRecording) {
      recognitionRef.current?.stop();
    } else {
      setVoiceState(prev => ({ ...prev, isRecording: true }));
      recognitionRef.current?.start();
    }
  };
  
  // Handle text-to-speech
  const speakMessage = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    
    // Stop any ongoing speech
    speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-MX';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => setVoiceState(prev => ({ ...prev, isPlaying: true }));
    utterance.onend = () => setVoiceState(prev => ({ ...prev, isPlaying: false }));
    utterance.onerror = () => setVoiceState(prev => ({ ...prev, isPlaying: false }));
    
    speechSynthesis.speak(utterance);
  };
  
  // Handle quick actions
  const handleQuickAction = (action: string, params?: any) => {
    switch (action) {
      case 'search_products':
        setCurrentMessage(`Buscar productos: ${params?.query || ''}`);
        break;
      case 'view_cart':
        setCurrentMessage('Mostrar mi carrito de compras');
        break;
      case 'track_order':
        setCurrentMessage('Rastrear mi pedido');
        break;
      case 'contact_seller':
        setCurrentMessage(`Contactar vendedor: ${params?.seller || ''}`);
        break;
      case 'product_info':
        setCurrentMessage(`Información sobre producto ${params?.productId || ''}`);
        break;
      case 'recommendations':
        setCurrentMessage('Mostrar recomendaciones personalizadas');
        break;
      default:
        setCurrentMessage(action);
    }
  };
  
  // Predefined quick questions
  const quickQuestions = [
    { label: "¿Cómo verifico la autenticidad?", query: "¿Cómo puedo verificar que la plata es auténtica?" },
    { label: "Métodos de pago", query: "¿Qué métodos de pago aceptan?" },
    { label: "Tiempos de envío", query: "¿Cuánto tiempo tarda el envío?" },
    { label: "Devoluciones", query: "¿Cuál es su política de devoluciones?" },
    { label: "Recomendaciones", query: "Recomiéndame productos según mis gustos" },
    { label: "Ofertas especiales", query: "¿Hay ofertas especiales disponibles?" }
  ];
  
  if (isMinimized) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-2 border-primary/20">
        <CardHeader 
          className="pb-2 cursor-pointer flex flex-row items-center justify-between"
          onClick={onToggleMinimize}
        >
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm">Asistente IA</CardTitle>
            <Badge variant="secondary" className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </CardHeader>
        {messages.length > 0 && (
          <CardContent className="pt-0 pb-2">
            <p className="text-xs text-gray-600 line-clamp-2">
              {messages[messages.length - 1]?.message}
            </p>
          </CardContent>
        )}
      </Card>
    );
  }
  
  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-xl border-2 border-primary/20 flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/bot-avatar.png" alt="PlataMX AI" />
              <AvatarFallback className="bg-primary text-white">
                <Bot className="w-4 h-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">Asistente PlataMX</CardTitle>
              <CardDescription className="text-xs flex items-center">
                <Badge variant="secondary" className="text-xs mr-2">
                  <Sparkles className="w-3 h-3 mr-1" />
                  IA
                </Badge>
                {isTyping && (
                  <span className="text-green-600">Escribiendo...</span>
                )}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="sm" onClick={onToggleMinimize} className="h-6 w-6 p-0">
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {/* Welcome message */}
          {messages.length === 0 && !messagesLoading && (
            <div className="space-y-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <Bot className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">
                        ¡Hola! Soy tu asistente de PlataMX. Puedo ayudarte con:
                      </p>
                      <ul className="text-xs text-gray-600 mt-2 space-y-1">
                        <li>• Encontrar productos perfectos para ti</li>
                        <li>• Información sobre autenticidad y calidad</li>
                        <li>• Rastrear pedidos y resolver dudas</li>
                        <li>• Recomendaciones personalizadas</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick questions */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Preguntas frecuentes:</p>
                <div className="grid grid-cols-2 gap-2">
                  {quickQuestions.slice(0, 4).map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs h-auto py-2 px-3"
                      onClick={() => setCurrentMessage(question.query)}
                    >
                      {question.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Chat messages */}
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                {/* Message bubble */}
                <Card className={`${
                  message.sender === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 dark:bg-gray-800'
                }`}>
                  <CardContent className="p-3">
                    <div className="flex items-start space-x-2">
                      {message.sender !== 'user' && (
                        <Bot className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="text-sm">{message.message}</p>
                        
                        {/* AI Confidence */}
                        {message.confidence && message.sender === 'ai' && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(message.confidence * 100)}% confianza
                          </Badge>
                        )}
                        
                        {/* Product recommendations */}
                        {message.productRecommendations && message.productRecommendations.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-xs font-medium">Productos recomendados:</p>
                            <div className="space-y-2">
                              {message.productRecommendations.map((product) => (
                                <Card key={product.id} className="bg-white">
                                  <CardContent className="p-3">
                                    <div className="flex items-center space-x-3">
                                      <img 
                                        src={product.image} 
                                        alt={product.title}
                                        className="w-12 h-12 rounded object-cover"
                                      />
                                      <div className="flex-1">
                                        <h4 className="text-xs font-medium text-gray-900 line-clamp-2">
                                          {product.title}
                                        </h4>
                                        <p className="text-sm font-bold text-primary">
                                          {product.price}
                                        </p>
                                      </div>
                                      <Button size="sm" className="text-xs">
                                        Ver
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Quick actions */}
                        {message.quickActions && message.quickActions.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {message.quickActions.map((action, index) => (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                className="text-xs h-6"
                                onClick={() => handleQuickAction(action.action)}
                              >
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Suggestions */}
                        {message.suggestions && message.suggestions.length > 0 && (
                          <div className="space-y-1">
                            <p className="text-xs font-medium">Sugerencias:</p>
                            {message.suggestions.map((suggestion, index) => (
                              <Button
                                key={index}
                                variant="ghost"
                                size="sm"
                                className="text-xs h-auto py-1 justify-start"
                                onClick={() => setCurrentMessage(suggestion)}
                              >
                                {suggestion}
                              </Button>
                            ))}
                          </div>
                        )}
                        
                        {/* Timestamp */}
                        <div className="flex items-center justify-between">
                          <p className="text-xs opacity-70">
                            {new Date(message.timestamp).toLocaleTimeString('es-MX', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                          
                          {/* Voice controls for AI messages */}
                          {message.sender === 'ai' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-70 hover:opacity-100"
                              onClick={() => speakMessage(message.message)}
                              disabled={voiceState.isPlaying}
                            >
                              {voiceState.isPlaying ? (
                                <VolumeX className="w-3 h-3" />
                              ) : (
                                <Volume2 className="w-3 h-3" />
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <Card className="bg-gray-100 dark:bg-gray-800">
                <CardContent className="p-3">
                  <div className="flex items-center space-x-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-75" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Input */}
      <div className="border-t p-4">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              placeholder="Escribe tu pregunta..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="pr-10"
              data-testid="chat-input"
            />
            {voiceState.isSupported && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1 h-6 w-6 p-0"
                onClick={toggleVoiceRecording}
                data-testid="voice-input-button"
              >
                {voiceState.isRecording ? (
                  <MicOff className="w-4 h-4 text-red-600" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!currentMessage.trim() || sendMessageMutation.isPending}
            size="sm"
            data-testid="send-message-button"
          >
            {sendMessageMutation.isPending ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}