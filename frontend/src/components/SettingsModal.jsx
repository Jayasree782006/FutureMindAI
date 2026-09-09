import React, { useState, useEffect } from 'react';
import { X, Settings, Key, HelpCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';

const SettingsModal = ({ isOpen, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');
  const [useMock, setUseMock] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem('FUTUREMIND_GEMINI_KEY') || '';
    const savedMock = localStorage.getItem('FUTUREMIND_USE_MOCK') === 'true';
    setApiKey(savedKey);
    setUseMock(savedMock);
  }, [isOpen]);

  const handleSave = () => {
    localStorage.setItem('FUTUREMIND_GEMINI_KEY', apiKey);
    localStorage.setItem('FUTUREMIND_USE_MOCK', String(useMock));
    onSave({ apiKey, useMock });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md p-6 rounded-2xl relative border border-white/10 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Settings className="w-5 h-5 text-neon-purple animate-spin-slow" style={{ animationDuration: '6s' }} />
          System Settings
        </h3>

        <div className="space-y-6">
          {/* API Key input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-neon-teal" />
              Gemini API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your gemini-2.5 key..."
              className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-teal focus:ring-1 focus:ring-neon-teal transition-all"
            />
            <p className="text-[10px] text-gray-500 leading-normal">
              Your key is saved locally in your browser cache and sent only to your local FastAPI server. It is never uploaded to any public database.
            </p>
          </div>

          {/* Toggle mock mode */}
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-semibold text-gray-200">Offline Simulation Mode</span>
              <span className="text-xs text-gray-500">Run predictions using pre-coded local psychology models</span>
            </div>
            <button
              onClick={() => setUseMock(!useMock)}
              className="text-gray-300 hover:text-white transition cursor-pointer"
            >
              {useMock ? (
                <ToggleRight className="w-9 h-9 text-neon-teal" />
              ) : (
                <ToggleLeft className="w-9 h-9 text-gray-500" />
              )}
            </button>
          </div>

          {/* Warning box */}
          {!apiKey && !useMock && (
            <div className="p-3 bg-neon-amber/10 border border-neon-amber/20 rounded-xl flex gap-2 text-xs text-neon-amber">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong className="block font-bold mb-0.5">No API Key configured</strong>
                The server will fallback to offline mock simulations until you provide a key or activate mock mode.
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-neon-teal text-black text-xs font-bold shadow-lg shadow-neon-teal/10 hover:brightness-110 hover:scale-[1.02] transition cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
