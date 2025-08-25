'use client';

import { useState, useEffect, useRef } from 'react';
import { N8nWebhookResponse } from '@/types/dashboard.types';

interface IssueCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMessage?: string;
}

export function IssueCreationModal({ isOpen, onClose, initialMessage = '' }: IssueCreationModalProps) {
  const [message, setMessage] = useState(initialMessage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [issueUrl, setIssueUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setMessage(initialMessage);
      setError(null);
      setSuccess(false);
      setIssueUrl(null);
    }
  }, [isOpen, initialMessage]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/n8n-webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create issue');
      }

      const result: N8nWebhookResponse = await response.json();
      
      if (result.workflowStatus === 'completed' && result.issueWebUrl) {
        setSuccess(true);
        setIssueUrl(result.issueWebUrl);
      } else {
        throw new Error('Workflow did not complete successfully');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleCreateAnother = () => {
    setMessage('');
    setSuccess(false);
    setIssueUrl(null);
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      {/* Backdrop with glassmorphism */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal with glassmorphism and red theme */}
      <div 
        className="relative bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden border border-gray-200 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Create GitLab Issue
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Describe the data quality issue in natural language
          </p>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {!success ? (
            <>
              <div className="mb-4">
                <label htmlFor="issue-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Issue Description
                </label>
                <textarea
                  ref={textareaRef}
                  id="issue-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Example: There is an increase in the HR system failure rate percentage by 34%. Assign it to aibardchatgpt17@gmail.com"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={5}
                  maxLength={1000}
                  disabled={loading}
                />
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  {message.length}/1000 characters
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Issue Created Successfully!
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Your GitLab issue has been created and a notification has been sent.
              </p>

              {issueUrl && (
                <a
                  href={issueUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium focus:ring-2 focus:ring-red-500 rounded px-2 py-1 transition-colors"
                >
                  View Issue on GitLab
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                  </svg>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50/80 dark:bg-gray-800/80 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 backdrop-blur-sm">
          {!success ? (
            <>
              <button
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2 focus:ring-2 focus:ring-red-500 transition-colors"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {loading ? 'Creating Issue...' : 'Create Issue'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCreateAnother}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:ring-2 focus:ring-gray-500 transition-colors"
              >
                Create Another Issue
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 transition-colors"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}