import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Key, Save, Eye, EyeOff } from 'lucide-react';

export function SettingsPage() {
  const { currentUser, userData, updateUserSettings } = useAuth();
  const navigate = useNavigate();
  const [veoApiKey, setVeoApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  useEffect(() => {
    if (userData?.veoApiKey) {
      setVeoApiKey(userData.veoApiKey);
    }
  }, [userData]);

  const handleSave = async () => {
    if (!currentUser) return;

    setSaving(true);
    setSaveMessage(null);

    try {
      await updateUserSettings({ veoApiKey: veoApiKey.trim() });
      setSaveMessage({
        type: 'success',
        text: 'Settings saved successfully!',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950">
      <header className="bg-dark-900 border-b border-dark-800 sticky top-0 z-50 backdrop-blur-xl bg-dark-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 button-secondary text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <h1 className="text-xl font-bold text-white">Settings</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-2">
              API Configuration
            </h2>
            <p className="text-gray-400 text-sm">
              Configure your Google AI API key to use Veo models for video generation.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="veo-api-key"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  Google AI API Key (Veo)
                </div>
              </label>
              <div className="relative">
                <input
                  id="veo-api-key"
                  type={showApiKey ? 'text' : 'password'}
                  value={veoApiKey}
                  onChange={(e) => setVeoApiKey(e.target.value)}
                  placeholder="Enter your Google AI API key"
                  className="input-field block w-full pr-12 font-mono text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                >
                  {showApiKey ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-500 hover:text-primary-400 underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            {saveMessage && (
              <div
                className={`p-4 rounded-lg ${
                  saveMessage.type === 'success'
                    ? 'bg-green-900/20 text-green-400 border border-green-800'
                    : 'bg-red-900/20 text-red-400 border border-red-800'
                }`}
              >
                {saveMessage.text}
              </div>
            )}

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={saving || !veoApiKey.trim()}
                className="button-primary inline-flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>

          <div className="border-t border-dark-800 pt-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  Email
                </label>
                <p className="text-white mt-1">{currentUser?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400">
                  User ID
                </label>
                <p className="text-white mt-1 font-mono text-sm">
                  {currentUser?.uid}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
