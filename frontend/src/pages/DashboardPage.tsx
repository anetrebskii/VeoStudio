import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GeneratorForm } from '@/components/VideoGenerator/GeneratorForm';
import { GenerationsList } from '@/components/VideoGenerator/GenerationsList';
import { UsageStats } from '@/components/VideoGenerator/UsageStats';
import {
  createVideoGeneration,
  getUserGenerations,
  getUserUsage,
} from '@/services/videoService';
import { VideoGeneration, VideoGenerationRequest, UserUsage } from '@/types';
import { LogOut, RefreshCw, Settings, ChevronDown, User, Video, Plus, Menu, X } from 'lucide-react';

type ViewMode = 'generate' | 'videos';

export function DashboardPage() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [generations, setGenerations] = useState<VideoGeneration[]>([]);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('generate');
  const menuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    if (!currentUser) return;

    setRefreshing(true);
    try {
      const [genData, usageData] = await Promise.all([
        getUserGenerations(currentUser.uid),
        getUserUsage(currentUser.uid),
      ]);
      setGenerations(genData);
      setUsage(usageData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (request: VideoGenerationRequest) => {
    if (!currentUser) return;

    setLoading(true);
    try {
      await createVideoGeneration(currentUser.uid, request);
      await loadData();
    } catch (error) {
      console.error('Error creating generation:', error);
      alert('Failed to create video generation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-dark-900">
      <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50 backdrop-blur-xl bg-dark-800/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 hover:bg-dark-700 rounded-lg transition-colors"
              >
                {showMobileSidebar ? (
                  <X className="w-5 h-5 text-gray-400" />
                ) : (
                  <Menu className="w-5 h-5 text-gray-400" />
                )}
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white">
                Video Studio
              </h1>
            </div>
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 hover:bg-dark-700 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center relative">
                  <User className="w-4 h-4 text-white" />
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-dark-900"></div>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-dark-700 border border-dark-600 rounded-xl shadow-lg overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-dark-600">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {currentUser?.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                          {currentUser?.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-dark-600 transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </button>
                  <div className="border-t border-dark-600"></div>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleSignOut();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-dark-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Mobile Sidebar Overlay */}
        {showMobileSidebar && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setShowMobileSidebar(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40
            w-64 bg-dark-800 border-r border-dark-700 flex flex-col
            transform transition-transform duration-200 ease-in-out
            ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            mt-[73px] lg:mt-0
          `}
        >
          <nav className="flex-1 p-4 space-y-2">
            <button
              onClick={() => {
                setViewMode('generate');
                setShowMobileSidebar(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'generate'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Plus className="h-5 w-5" />
              Generate New
            </button>
            <button
              onClick={() => {
                setViewMode('videos');
                setShowMobileSidebar(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                viewMode === 'videos'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Video className="h-5 w-5" />
              Videos
            </button>
          </nav>

          {/* Usage Stats in Sidebar */}
          <div className="p-4 border-t border-dark-700">
            <h3 className="text-sm font-semibold text-white mb-3">
              Usage Stats
            </h3>
            <UsageStats usage={usage} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {viewMode === 'generate' ? (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Create Video
                  </h2>
                  <div className="flex gap-2">
                    <button className="tab-button tab-button-active">
                      Generate
                    </button>
                    <button className="tab-button tab-button-inactive">
                      Preview
                    </button>
                  </div>
                </div>
                <GeneratorForm onSubmit={handleSubmit} loading={loading} />
              </div>
            ) : (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">
                    Your Videos
                  </h2>
                  <button
                    onClick={loadData}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </button>
                </div>
                <GenerationsList generations={generations} />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
