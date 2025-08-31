import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AiChatbot } from '@/components/AiChatbot';
import { Bot, MessageSquare } from 'lucide-react';

export function ChatbotToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-200 bg-primary hover:bg-primary/90"
          data-testid="chatbot-open-button"
        >
          <Bot className="w-6 h-6" />
          <span className="sr-only">Abrir asistente</span>
        </Button>
        
        {/* New message indicator */}
        <Badge className="absolute -top-2 -left-2 bg-red-500 text-white px-2 py-1 text-xs animate-pulse">
          ¡Nuevo!
        </Badge>
      </div>
    );
  }

  return (
    <div className="fixed z-50">
      <AiChatbot
        isMinimized={isMinimized}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        onClose={() => setIsOpen(false)}
      />
    </div>
  );
}