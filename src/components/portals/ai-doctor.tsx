
'use client';

import { useState, useRef, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import { askDoctor } from '@/ai/flows/ask-doctor-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

export function AIDoctor() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      text: 'Halo! Saya adalah asisten kesehatan Puskesmas Pondok Jagung. Silakan jelaskan keluhan Anda, dan saya akan mencoba memberikan analisis awal. Ingat, saya bukan pengganti dokter sungguhan.',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
        const scrollableViewport = scrollAreaRef.current.querySelector('div');
        if (scrollableViewport) {
            scrollableViewport.scrollTop = scrollableViewport.scrollHeight;
        }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const result = await askDoctor(currentInput);
      const responseText = result.response;
      
      const botMessage: Message = { role: 'bot', text: responseText };
      setMessages((prev) => [...prev, botMessage]);

    } catch (error) {
      console.error('Error contacting AI Doctor:', error);
      const errorMessage: Message = {
        role: 'bot',
        text: 'Maaf, sepertinya saya sedang mengalami gangguan. Silakan coba lagi nanti.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto shadow-2xl">
      <CardContent className="p-4">
        <div className="flex flex-col h-[500px]">
          <ScrollArea className="flex-grow p-4 border rounded-lg" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'bot' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'p-3 rounded-lg max-w-[80%] whitespace-pre-wrap',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                  </div>
                   {message.role === 'user' && (
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <User size={20} />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
               {isLoading && (
                  <div className="flex items-start gap-3 justify-start">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot size={20} />
                      </AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-lg bg-muted flex items-center space-x-2">
                       <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                       <span className="text-sm text-muted-foreground">AI sedang mengetik...</span>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik keluhan Anda di sini..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Kirim</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
