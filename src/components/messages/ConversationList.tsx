import React from 'react';
import { User, Package } from 'lucide-react';
import { Conversation } from '../../hooks/useMessaging';
import { format, isToday, isYesterday } from 'date-fns';
import { OptimizedImage } from '../inventory/OptimizedImage';
import { extractNameFromDescription } from '../../utils/nameExtractor';
import { useAuth } from '../../contexts/AuthContext';

interface ConversationListProps {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  otherUserOnline?: boolean;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeConversation,
  onSelectConversation,
  otherUserOnline = false,
}) => {
  const { user } = useAuth();
  const formatTime = (date: string) => {
    const d = new Date(date);
    if (isToday(d)) {
      return format(d, 'h:mm a');
    } else if (isYesterday(d)) {
      return 'Yesterday';
    } else {
      return format(d, 'MMM d');
    }
  };

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            No conversations yet
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
        const sellerName = conversation.listing?.description
          ? extractNameFromDescription(conversation.listing.description)
          : null;
        const displaySellerName = sellerName || conversation.listing.full_name ; //|| 'Seller';
        const isSentByMe = conversation.last_message?.sender_id === user?.id;
        const senderLabel = isSentByMe ? 'You' : (conversation.other_user?.full_name?.split(' ')[0] || 'They');

        return (
          <button
            key={conversation.id}
            onClick={() => onSelectConversation(conversation)}
            className={`w-full px-3 py-3 flex items-start space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 ${
              activeConversation?.id === conversation.id
                ? 'bg-green-50 dark:bg-green-900/20'
                : ''
            }`}
          >
            {/* Item Image */}
            {conversation.listing?.photo_url ? (
              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                <OptimizedImage
                  src={conversation.listing.photo_url}
                  alt={conversation.listing.title}
                  className="w-full h-full object-cover"
                  fallbackIcon={<Package className="h-8 w-8 text-gray-400" />}
                />
                {activeConversation?.id === conversation.id && otherUserOnline && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>
            ) : (
              <div className="flex-shrink-0 relative">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-lg flex items-center justify-center">
                  <Package className="h-8 w-8 text-white" />
                </div>
                {activeConversation?.id === conversation.id && otherUserOnline && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                )}
              </div>
            )}

            <div className="flex-1 min-w-0">
              {/* Item Title & Time */}
              <div className="flex items-start justify-between mb-1 gap-2">
                <div className="flex-1 min-w-0">
                  {conversation.listing ? (
                    <>
                      <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm leading-tight">
                        {conversation.listing.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        Seller: <span className="font-medium text-green-600 dark:text-green-400">{displaySellerName}</span>
                      </p>
                    </>
                  ) : (
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate text-sm">
                      {conversation.other_user?.full_name || conversation.other_user?.email}
                    </h3>
                  )}
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {conversation.last_message
                    ? formatTime(conversation.last_message.created_at)
                    : formatTime(conversation.created_at)}
                </span>
              </div>

              {/* Last Message with Sender */}
              {conversation.last_message && (
                <div className="flex items-start gap-1.5 mt-1.5">
                  <span className={`text-xs font-medium flex-shrink-0 ${
                    isSentByMe
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}>
                    {senderLabel}:
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate flex-1">
                    {conversation.last_message.message_text}
                  </p>
                </div>
              )}

              {/* Unread Badge */}
              {conversation.unread_count != null && conversation.unread_count > 0 && (
                <div className="mt-1.5">
                  <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500 text-white">
                    {conversation.unread_count} new
                  </span>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};
