import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Trash2, ExternalLink } from 'lucide-react';
import { Conversation, Message } from '../../hooks/useMessaging';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { TypingIndicator } from './TypingIndicator';
import { ListingDetailModal } from '../marketplace/ListingDetailModal';
import { MarketplaceListing } from '../../hooks/useMarketplace';

interface MessageThreadProps {
  conversation: Conversation;
  messages: Message[];
  onSendMessage: (text: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  sending: boolean;
  isTyping: boolean;
  otherUserOnline: boolean;
  onTypingStart: () => void;
  onTypingStop: () => void;
}

export const MessageThread: React.FC<MessageThreadProps> = ({
  conversation,
  messages,
  onSendMessage,
  onDeleteMessage,
  sending,
  isTyping,
  otherUserOnline,
  onTypingStart,
  onTypingStop,
}) => {
  const { user } = useAuth();
  const [messageText, setMessageText] = useState('');
  const [deletingMessageId, setDeletingMessageId] = useState<string | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || sending) return;

    const text = messageText;
    setMessageText('');
    onTypingStop();
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;
    setDeletingMessageId(messageId);
    await onDeleteMessage(messageId);
    setDeletingMessageId(null);
  };

  return (
    <>
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-semibold">
              {(conversation.other_user?.full_name?.[0] || conversation.other_user?.email?.[0] || 'U').toUpperCase()}
            </div>
            {otherUserOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white">
              {conversation.other_user?.full_name || conversation.other_user?.email}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {otherUserOnline ? 'Online' : conversation.other_user?.email}
            </p>
            {conversation.listing && (
              <div className="mt-2">
                <button
                  onClick={() => setShowListingModal(true)}
                  className="flex items-center space-x-2 group hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 -ml-2 transition-colors"
                >
                  {conversation.listing.photo_url && (
                    <img
                      src={conversation.listing.photo_url}
                      alt={conversation.listing.title}
                      className="w-10 h-10 object-cover rounded border border-gray-200 dark:border-gray-600"
                    />
                  )}
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs text-green-600 dark:text-green-400 truncate font-medium">
                      {conversation.listing.title}
                    </p>
                    {conversation.listing.user_profile && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        Listed by {conversation.listing.users_name || conversation.listing.user_profile.full_name || conversation.listing.user_profile.email}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                Start the conversation
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group`}
                >
                <div className={`max-w-xs lg:max-w-md ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div className="flex items-start gap-2">
                    {isOwn && (
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        disabled={deletingMessageId === message.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity mt-1 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded disabled:opacity-50"
                        title="Delete message"
                      >
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </button>
                    )}
                    <div>
                      <div
                        className={`rounded-2xl px-4 py-2 ${
                          isOwn
                            ? 'bg-green-500 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <p className="whitespace-pre-wrap break-words">
                          {message.message_text}
                        </p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                          isOwn ? 'text-right' : 'text-left'
                        }`}
                      >
                        {format(new Date(message.created_at), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
            {isTyping && <TypingIndicator />}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleSubmit} className="flex items-end space-x-2">
          <textarea
            value={messageText}
            onChange={(e) => {
              setMessageText(e.target.value);
              onTypingStart();
              if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
              }
              typingTimeoutRef.current = setTimeout(() => {
                onTypingStop();
              }, 2000);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-2xl focus:ring-2 focus:ring-green-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none"
            style={{ minHeight: '40px', maxHeight: '120px' }}
          />
          <button
            type="submit"
            disabled={!messageText.trim() || sending}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>

    {showListingModal && conversation.listing && (
      <ListingDetailModal
        listing={conversation.listing as unknown as MarketplaceListing}
        onClose={() => setShowListingModal(false)}
        onContact={() => {}}
      />
    )}
    </>
  );
};
