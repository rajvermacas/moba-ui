/**
 * Session list component for viewing and switching between chat sessions
 */

import React, { useState } from 'react';
import { MessageSquare, ChevronDown, Trash2, Edit2, Check, X } from 'lucide-react';
import { useSession } from '../contexts/SessionContext';
import { clsx } from 'clsx';
import { ChatSession } from '../types/chat.types';

interface SessionListProps {
  className?: string;
}

export const SessionList: React.FC<SessionListProps> = ({ className }) => {
  const { 
    sessions, 
    currentSessionId, 
    switchSession, 
    deleteSession,
    updateSessionTitle 
  } = useSession();
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  const sortedSessions = Array.from(sessions.values()).sort((a, b) => 
    b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
  );

  const currentSession = currentSessionId ? sessions.get(currentSessionId) : null;

  const handleSessionClick = (sessionId: string) => {
    if (sessionId !== currentSessionId) {
      switchSession(sessionId);
    }
    setIsOpen(false);
  };

  const handleEditStart = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  const handleEditSave = () => {
    if (editingSessionId && editTitle.trim()) {
      updateSessionTitle(editingSessionId, editTitle.trim());
      setEditingSessionId(null);
      setEditTitle('');
    }
  };

  const handleEditCancel = () => {
    setEditingSessionId(null);
    setEditTitle('');
  };

  const handleDelete = async (sessionId: string) => {
    setDeletingSessionId(sessionId);
    try {
      await deleteSession(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setDeletingSessionId(null);
    }
  };

  if (sortedSessions.length === 0) {
    return null;
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200',
          'bg-white hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700',
          'border border-gray-200 dark:border-gray-700',
          'text-gray-700 dark:text-gray-200',
          'focus:outline-none focus:ring-2 focus:ring-red-500/50'
        )}
      >
        <MessageSquare className="h-4 w-4" />
        <span className="text-sm font-medium">
          {currentSession?.title || 'Select Session'}
        </span>
        <ChevronDown className={clsx(
          'h-4 w-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className={clsx(
            'absolute top-full mt-2 right-0 z-50',
            'min-w-[280px] max-w-sm',
            'glass dark:glass-dark rounded-lg shadow-xl',
            'border border-gray-200 dark:border-gray-700',
            'max-h-96 overflow-y-auto'
          )}>
            <div className="p-2">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2 py-1 mb-1">
                Your Sessions ({sortedSessions.length})
              </div>
              
              {sortedSessions.map((session) => (
                <div
                  key={session.id}
                  className={clsx(
                    'group relative rounded-lg mb-1',
                    'transition-all duration-200',
                    session.id === currentSessionId
                      ? 'bg-red-50 dark:bg-red-900/20'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  {editingSessionId === session.id ? (
                    // Edit Mode
                    <div className="flex items-center gap-2 p-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEditSave();
                          if (e.key === 'Escape') handleEditCancel();
                        }}
                        className={clsx(
                          'flex-1 px-2 py-1 rounded text-sm',
                          'bg-white dark:bg-gray-700',
                          'border border-gray-300 dark:border-gray-600',
                          'focus:outline-none focus:ring-2 focus:ring-red-500/50'
                        )}
                        autoFocus
                      />
                      <button
                        onClick={handleEditSave}
                        className="p-1 text-green-600 hover:text-green-700"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={handleEditCancel}
                        className="p-1 text-gray-500 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    // View Mode
                    <div
                      onClick={() => handleSessionClick(session.id)}
                      className="flex items-center justify-between p-2 cursor-pointer"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          <span className={clsx(
                            'text-sm font-medium truncate',
                            session.id === currentSessionId
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-700 dark:text-gray-200'
                          )}>
                            {session.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 ml-6">
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {session.messageCount} messages
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(session.lastMessageAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditStart(session);
                          }}
                          className={clsx(
                            'p-1 rounded transition-colors',
                            'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                          )}
                          title="Rename session"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        {sortedSessions.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                            disabled={deletingSessionId === session.id}
                            className={clsx(
                              'p-1 rounded transition-colors',
                              'text-gray-400 hover:text-red-600 dark:hover:text-red-400',
                              'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                            title="Delete session"
                          >
                            <Trash2 className={clsx(
                              'h-3.5 w-3.5',
                              deletingSessionId === session.id && 'animate-pulse'
                            )} />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SessionList;