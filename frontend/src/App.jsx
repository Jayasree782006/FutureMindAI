import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, History, Settings } from 'lucide-react';
import DecisionConsole from './components/DecisionConsole';
import Dashboard from './components/Dashboard';
import HistoryDashboard from './components/HistoryDashboard';
import SettingsModal from './components/SettingsModal';

const App = () => {
  const [activeTab, setActiveTab] = useState('console'); // 'console', 'history', 'dashboard'
  const [decisions, setDecisions] = useState([]);
  const [activeAnalysis, setActiveAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [systemConfig, setSystemConfig] = useState({
    apiKey: localStorage.getItem('FUTUREMIND_GEMINI_KEY') || '',
    useMock: localStorage.getItem('FUTUREMIND_USE_MOCK') === 'true'
  });

  // Fetch history on startup
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/decisions');
      if (response.ok) {
        const data = await response.json();
        setDecisions(data);
      } else {
        const errorText = await response.text();
        setErrorMessage(`Failed to load history: ${response.status} ${response.statusText} ${errorText}`);
      }
    } catch (err) {
      console.error('Error fetching decision history:', err);
      setErrorMessage('Error fetching decision history. Check backend connectivity.');
    }
  };

  const handleSubmitDecision = async (payload) => {
    setLoading(true);
    setErrorMessage('');
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      
      // Inject API Key from client settings if available
      if (systemConfig.apiKey) {
        headers['X-Gemini-Key'] = systemConfig.apiKey;
      }
      
      // Inject Mock Mode flag if active
      if (systemConfig.useMock) {
        headers['X-Mock-Mode'] = 'true';
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let message = `API Analysis failed: ${response.status}`;
        try {
          const json = JSON.parse(errorText);
          if (json.detail) message += ` - ${json.detail}`;
          else message += ` - ${JSON.stringify(json)}`;
        } catch {
          message += ` - ${errorText}`;
        }
        throw new Error(message);
      }

      const result = await response.json();
      setActiveAnalysis(result);
      setActiveTab('dashboard');
      fetchHistory(); // Refresh logs
    } catch (err) {
      console.error('Error simulating decision:', err);
      if (err.name === 'AbortError') {
        // Try fast mock fallback if the primary analyze timed out
        try {
          setStatusMessage('Primary request timed out — falling back to fast local analysis...');
          const mockResp = await fetch('/api/analyze/mock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-Mock-Mode': 'true' },
            body: JSON.stringify(payload),
          });
          if (mockResp.ok) {
            const mockResult = await mockResp.json();
            setActiveAnalysis(mockResult);
            setActiveTab('dashboard');
            fetchHistory();
            setStatusMessage('Fast local analysis completed.');
            setErrorMessage('');
            return;
          }
          const txt = await mockResp.text();
          setErrorMessage(`Mock fallback failed: ${mockResp.status} ${txt}`);
        } catch (fallbackErr) {
          console.error('Mock fallback error:', fallbackErr);
          setErrorMessage('Request timed out. The analysis took too long. Please try again or enable mock mode.');
        }
      } else {
        setErrorMessage(err.message || 'Error running simulation. Check that the FastAPI server is running.');
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleDeleteDecision = async (id) => {
    if (!confirm('Are you sure you want to delete this decision log?')) return;
    try {
      const response = await fetch(`/api/decisions/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setDecisions(decisions.filter(d => d.id !== id));
        if (activeAnalysis && activeAnalysis.id === id) {
          setActiveAnalysis(null);
          setActiveTab('console');
        }
      }
    } catch (err) {
      console.error('Error deleting decision:', err);
    }
  };

  const handleResolveDecision = async (id, status) => {
    try {
      const response = await fetch(`/api/decisions/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actual_regret_status: status }),
      });
      if (response.ok) {
        const updated = await response.json();
        setDecisions(decisions.map(d => d.id === id ? updated : d));
        if (activeAnalysis && activeAnalysis.id === id) {
          setActiveAnalysis(updated);
        }
      }
    } catch (err) {
      console.error('Error resolving decision:', err);
    }
  };

  const handleSelectHistoryItem = (item) => {
    setActiveAnalysis(item);
    setActiveTab('dashboard');
  };

  const handleSaveSettings = (config) => {
    setSystemConfig(config);
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-12">
      {/* Background radial lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Main Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('console')}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-teal">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white leading-none">FutureMind AI</span>
              <span className="text-[10px] text-neon-teal font-semibold tracking-widest uppercase mt-0.5">Regret Prediction Engine</span>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('console')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activeTab === 'console' || activeTab === 'dashboard'
                  ? 'bg-white/5 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Console
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition relative cursor-pointer ${
                activeTab === 'history' ? 'bg-white/5 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              History Logs
              {decisions.length > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] bg-neon-purple text-white rounded-full font-bold">
                  {decisions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          </nav>
        </div>
      </header>

      {errorMessage && (
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="rounded-2xl border border-neon-pink/30 bg-neon-pink/10 text-neon-pink px-4 py-3 text-sm font-medium">
            <span className="font-bold">Error:</span> {errorMessage}
          </div>
        </div>
      )}

      {/* Main Contents */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-6 py-10 relative z-10">
        {activeTab === 'console' && (
          <div className="space-y-12">
            {/* Hero banner */}
            <div className="text-center max-w-2xl mx-auto space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neon-purple/10 border border-neon-purple/20 text-neon-purple text-xs font-semibold animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Next-Gen Decision Intelligence
              </div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
                Predict the emotional outcome <br />
                <span className="bg-gradient-to-r from-neon-purple via-neon-pink to-neon-teal bg-clip-text text-transparent">
                  before you take the leap.
                </span>
              </h1>
              <p className="text-sm font-light text-gray-400 leading-relaxed">
                Most regret occurs when emotions bypass logic. FutureMind AI simulates contrasting timelines, analyzing stress profiles and long-term satisfaction levels to empower your choice.
              </p>
            </div>

            <DecisionConsole onSubmit={handleSubmitDecision} loading={loading} />
          </div>
        )}

        {activeTab === 'dashboard' && (
          <Dashboard data={activeAnalysis} onReset={() => setActiveTab('console')} />
        )}

        {activeTab === 'history' && (
          <HistoryDashboard 
            decisions={decisions} 
            onSelect={handleSelectHistoryItem}
            onDelete={handleDeleteDecision}
            onResolve={handleResolveDecision}
          />
        )}
      </main>

      {/* Footer presentation quote */}
      <footer className="w-full mt-auto border-t border-white/5 pt-8 text-center text-xs text-gray-500 font-light max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <span>&copy; {new Date().getFullYear()} FutureMind AI. All rights reserved.</span>
        <span className="italic">
          "The future of AI is not just answering questions. The future of AI is helping humans make better life decisions."
        </span>
      </footer>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
      />
    </div>
  );
};

export default App;
