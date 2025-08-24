/**
 * New Chat button component with optional confirmation dialog
 */

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { clsx } from 'clsx';

interface NewChatButtonProps {
  showConfirmation?: boolean;
  disabled?: boolean;
  className?: string;
}

export const NewChatButton: React.FC<NewChatButtonProps> = ({
  showConfirmation = true,
  disabled = false,
  className
}) => {
  const { createNewSession, currentSessionId, getSessionMessages } = useSession();
  const [isCreating, setIsCreating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const handleNewChat = async () => {
    // Check if current session has messages
    const currentMessages = currentSessionId ? getSessionMessages(currentSessionId) : [];
    const hasMessages = currentMessages.length > 0;

    // Show confirmation if enabled and current session has messages
    if (showConfirmation && hasMessages && !showDialog) {
      setShowDialog(true);
      return;
    }

    // Create new session
    setIsCreating(true);
    try {
      await createNewSession();
      setShowDialog(false);
    } catch (error) {
      console.error('Failed to create new session:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
  };

  return (
    <>
      <button
        onClick={handleNewChat}
        disabled={disabled || isCreating}
        title="Start a new chat"
        className={clsx(
          'p-2 rounded-lg transition-all duration-200',
          'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
          'text-white focus:outline-none focus:ring-2 focus:ring-red-500/50',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'flex items-center gap-2',
          className
        )}
      >
        <Plus className={clsx(
          'h-5 w-5',
          isCreating && 'animate-spin'
        )} />
        <span className="text-sm font-medium">New Chat</span>
      </button>

      {/* Confirmation Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass dark:glass-dark rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
              Start New Chat?
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              Starting a new chat will switch to a fresh conversation. Your current chat will be saved and you can return to it later.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCancel}
                className={clsx(
                  'px-4 py-2 rounded-lg transition-all duration-200',
                  'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600',
                  'text-gray-700 dark:text-gray-200',
                  'focus:outline-none focus:ring-2 focus:ring-gray-500/50'
                )}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDialog(false);
                  handleNewChat();
                }}
                disabled={isCreating}
                className={clsx(
                  'px-4 py-2 rounded-lg transition-all duration-200',
                  'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800',
                  'text-white',
                  'focus:outline-none focus:ring-2 focus:ring-red-500/50',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isCreating ? 'Creating...' : 'Start New Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NewChatButton;