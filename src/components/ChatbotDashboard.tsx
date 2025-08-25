'use client';

import { useState } from 'react';
import ChatInterface from './ChatInterface';
import { Dashboard } from './Dashboard';
import { useTheme } from '@/contexts/ThemeContext';
import { ChevronLeft, ChevronRight, MessageSquare, BarChart3, Moon, Sun } from 'lucide-react';

export function ChatbotDashboard() {
  const { theme, toggleTheme } = useTheme();
  const [activeView, setActiveView] = useState<'chat' | 'dashboard' | 'split'>('split');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Header */}
      <header className="glass border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T2T</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Talk2Tables AI Assistant
              </h1>
            </div>

            {/* View Selector and Theme Toggle */}
            <div className="flex items-center space-x-4">
              {/* View Selector */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setActiveView('chat')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeView === 'chat'
                      ? 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat</span>
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeView === 'dashboard'
                      ? 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </button>
                <button
                  onClick={() => setActiveView('split')}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'split'
                      ? 'bg-white dark:bg-gray-700 text-red-700 dark:text-red-400 shadow-sm'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  <span>Split View</span>
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
                title="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden" style={{ height: 'calc(100vh - 60px)' }}>
        {/* Chat View */}
        {activeView === 'chat' && (
          <div className="w-full h-full">
            <ChatInterface />
          </div>
        )}

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="w-full h-full overflow-auto">
            <Dashboard />
          </div>
        )}

        {/* Split View */}
        {activeView === 'split' && (
          <>
            {/* Sidebar - Chat */}
            <div 
              className={`${
                sidebarCollapsed ? 'w-0' : 'w-1/3 min-w-[400px]'
              } transition-all duration-300 border-r border-gray-200 dark:border-gray-700 flex flex-col glass`}
            >
              {!sidebarCollapsed && (
                <div className="h-full">
                  <ChatInterface />
                </div>
              )}
            </div>

            {/* Collapse/Expand Button */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-r-lg p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              style={{ 
                left: sidebarCollapsed ? '0' : 'calc(33.333% - 1px)',
                transition: 'left 0.3s'
              }}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {/* Main Content - Dashboard */}
            <div className={`${
              sidebarCollapsed ? 'w-full' : 'w-2/3'
            } transition-all duration-300 overflow-auto`}>
              <Dashboard />
            </div>
          </>
        )}
      </div>
    </div>
  );
}