import React, { useState } from 'react';
import { ArrowRight, HelpCircle, Activity, PiggyBank, Heart, ShieldAlert } from 'lucide-react';
import VoiceInput from './VoiceInput';

const DecisionConsole = ({ onSubmit, loading }) => {
  const [inputText, setInputText] = useState('');
  const [stress, setStress] = useState(50);
  const [finance, setFinance] = useState(50);
  const [emotionRisk, setEmotionRisk] = useState(50);
  const [confidence, setConfidence] = useState(50);

  const sampleDecisions = [
    { text: "Should I leave my stable job to start a tech startup?", stress: 70, finance: 80, risk: 90, conf: 60 },
    { text: "Should I buy a house now with high interest rates or keep renting?", stress: 60, finance: 90, risk: 40, conf: 50 },
    { text: "Should I break up with my long-term partner because we want different futures?", stress: 90, finance: 20, risk: 95, conf: 40 },
    { text: "Should I continue my college degree or drop out to do full-time freelancing?", stress: 65, finance: 50, risk: 80, conf: 70 }
  ];

  const selectSample = (sample) => {
    setInputText(sample.text);
    setStress(sample.stress);
    setFinance(sample.finance);
    setEmotionRisk(sample.risk);
    setConfidence(sample.conf);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSubmit({
      input_text: inputText,
      stress_level: stress,
      financial_cost: finance,
      emotional_risk: emotionRisk,
      confidence_level: confidence
    });
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
      <div className="glass-panel p-8 rounded-2xl glow-shadow-purple relative overflow-hidden">
        {/* Background glow circle */}
        <div className="ambient-purple -top-12 -right-12" />

        <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
          <Activity className="text-neon-purple w-6 h-6 animate-pulse" />
          Quantum Decision Console
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Main prompt input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-300 flex items-center justify-between">
              <span>What decision are you facing?</span>
              <span className="text-xs text-gray-500 font-normal">State it as a 'should I...' question</span>
            </label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Example: Should I resign from my stable corporate role to start a bootstrap design agency?"
              className="w-full h-32 px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-neon-purple focus:ring-1 focus:ring-neon-purple transition-all resize-none font-light"
              disabled={loading}
              required
            />
          </div>

          {/* Voice Input integration */}
          <div className="py-4 border-y border-white/5 flex flex-col items-center">
            <VoiceInput
              onTranscriptionComplete={(text) => setInputText(text)}
              disabled={loading}
            />
          </div>

          {/* Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stress level */}
            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-neon-pink" />
                  Initial Stress Level
                </span>
                <span className="text-neon-pink font-bold">{stress}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={stress}
                onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-pink"
                disabled={loading}
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Completely Calm</span>
                <span>Highly Anxious</span>
              </div>
            </div>

            {/* Financial cost */}
            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <PiggyBank className="w-4 h-4 text-neon-amber" />
                  Financial Risk / Investment
                </span>
                <span className="text-neon-amber font-bold">{finance}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={finance}
                onChange={(e) => setFinance(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-amber"
                disabled={loading}
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Negligible Cost</span>
                <span>High Financial Stake</span>
              </div>
            </div>

            {/* Emotional risk */}
            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-neon-teal" />
                  Social / Emotional Stake
                </span>
                <span className="text-neon-teal font-bold">{emotionRisk}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={emotionRisk}
                onChange={(e) => setEmotionRisk(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-teal"
                disabled={loading}
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Emotionally Detached</span>
                <span>Deep Personal Impact</span>
              </div>
            </div>

            {/* Confidence Level */}
            <div className="space-y-3 bg-black/20 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300 font-medium flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-neon-purple" />
                  Current Confidence Level
                </span>
                <span className="text-neon-purple font-bold">{confidence}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={confidence}
                onChange={(e) => setConfidence(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-neon-purple"
                disabled={loading}
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Highly Uncertain</span>
                <span>Absolute Certainty</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !inputText.trim()}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
              loading || !inputText.trim()
                ? 'bg-white/5 border border-white/5 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-neon-purple to-neon-teal text-black shadow-lg shadow-neon-purple/20 hover:scale-[1.01] hover:brightness-110 cursor-pointer'
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Simulator Timelines...
              </span>
            ) : (
              <>
                Predict Emotional Impact
                <ArrowRight className="w-5 h-5 text-black" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick templates */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-gray-400 tracking-wider uppercase">Or Choose a Scenario Template</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {sampleDecisions.map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => selectSample(sample)}
              className="text-left p-4 rounded-xl bg-dark-card border border-white/5 hover:border-white/15 transition-all text-sm font-light text-gray-300 hover:text-white"
              disabled={loading}
            >
              "{sample.text}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DecisionConsole;
