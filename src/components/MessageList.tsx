/**
 * Component for displaying the list of chat messages with modern design
 */

import React, { useEffect, useRef } from 'react';
import { MessageCircle, Bot } from 'lucide-react';
import { ChatMessage } from '../types/chat.types';
import Message from './Message';

interface MessageListProps {
  messages: ChatMessage[];
  isTyping?: boolean;
  className?: string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isTyping = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }
    };

    // Small delay to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping]);

  // Handle manual scroll behavior
  const handleScroll = () => {
    // You could implement "scroll to see new messages" indicator here
    // if user has scrolled up and new messages arrive
  };

  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <div className="max-w-2xl mx-auto text-center">
          {/* Welcome Header */}
          <div className="mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center animate-glow">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Welcome to Talk2Tables
            </h1>
            <p className="text-gray-600 text-lg mb-8">
              Ask me questions about your database or type SQL queries directly.
            </p>
          </div>

          {/* Example Queries */}
          <div className="bg-white rounded-2xl p-6 text-left max-w-lg mx-auto border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Try asking:</h3>
            </div>
            <div className="space-y-2">
              {[
                "Show me all customers",
                "What are our top selling products?",
                "How many orders were placed last month?",
                'Or type SQL directly: "SELECT * FROM customers LIMIT 10"'
              ].map((example, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  <p className="text-gray-700 text-sm">{example}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-auto scrollbar-thin"
      onScroll={handleScroll}
    >
      <div className="max-w-4xl mx-auto py-4">
        {/* Messages */}
        {messages.map((message) => (
          <Message 
            key={message.id} 
            message={message}
          />
        ))}
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;