import React, { useState } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  ArrowLeft, RefreshCw, AlertCircle, ShieldCheck, Heart, Sparkles, 
  TrendingUp, HelpCircle, Activity, ChevronRight
} from 'lucide-react';

const Dashboard = ({ data, onReset }) => {
  const [activeTab, setActiveTab] = useState('timelines'); // 'timelines', 'analytics', 'swot'

  if (!data) return null;

  // Prepare chart data for regret over time
  // Milestones: 1 month, 6 months, 2 years, 5 years
  const lineData = [
    {
      name: 'Start',
      'Timeline A (Change)': data.regret_probability * 0.5,
      'Timeline B (Status Quo)': data.regret_probability * 0.3
    },
    {
      name: '1 Month',
      'Timeline A (Change)': data.timeline_a?.milestones?.[0]?.stress * 0.4 + (100 - data.timeline_a?.milestones?.[0]?.satisfaction) * 0.6,
      'Timeline B (Status Quo)': data.timeline_b?.milestones?.[0]?.stress * 0.4 + (100 - data.timeline_b?.milestones?.[0]?.satisfaction) * 0.6
    },
    {
      name: '6 Months',
      'Timeline A (Change)': data.timeline_a?.milestones?.[1]?.stress * 0.4 + (100 - data.timeline_a?.milestones?.[1]?.satisfaction) * 0.6,
      'Timeline B (Status Quo)': data.timeline_b?.milestones?.[1]?.stress * 0.4 + (100 - data.timeline_b?.milestones?.[1]?.satisfaction) * 0.6
    },
    {
      name: '2 Years',
      'Timeline A (Change)': data.timeline_a?.milestones?.[2]?.stress * 0.3 + (100 - data.timeline_a?.milestones?.[2]?.satisfaction) * 0.7,
      'Timeline B (Status Quo)': data.timeline_b?.milestones?.[2]?.stress * 0.3 + (100 - data.timeline_b?.milestones?.[2]?.satisfaction) * 0.7
    },
    {
      name: '5 Years',
      'Timeline A (Change)': data.timeline_a?.milestones?.[3]?.stress * 0.2 + (100 - data.timeline_a?.milestones?.[3]?.satisfaction) * 0.8,
      'Timeline B (Status Quo)': data.timeline_b?.milestones?.[3]?.stress * 0.2 + (100 - data.timeline_b?.milestones?.[3]?.satisfaction) * 0.8
    }
  ];

  // Let's normalize/clean regret scores to be bounded between 5% and 95%
  const cleanLineData = lineData.map(d => ({
    name: d.name,
    'Timeline A (Change)': Math.round(Math.min(95, Math.max(5, d['Timeline A (Change)']))),
    'Timeline B (Status Quo)': Math.round(Math.min(95, Math.max(5, d['Timeline B (Status Quo)'])))
  }));

  // Bar chart data comparing stress vs satisfaction at 6 months
  const barData = [
    {
      name: 'Timeline A (Change)',
      Satisfaction: Math.round(data.timeline_a?.milestones?.[1]?.satisfaction || 50),
      Stress: Math.round(data.timeline_a?.milestones?.[1]?.stress || 50),
    },
    {
      name: 'Timeline B (Status Quo)',
      Satisfaction: Math.round(data.timeline_b?.milestones?.[1]?.satisfaction || 50),
      Stress: Math.round(data.timeline_b?.milestones?.[1]?.stress || 50),
    }
  ];

  // Radar chart data for emotional baseline
  const radarData = [
    { subject: 'Anxiety', value: data.emotion_analysis?.anxiety || 50, fullMark: 100 },
    { subject: 'Confidence', value: data.emotion_analysis?.confidence || 50, fullMark: 100 },
    { subject: 'Excitement', value: data.emotion_analysis?.excitement || 50, fullMark: 100 },
    { subject: 'Hesitation', value: data.emotion_analysis?.hesitation || 50, fullMark: 100 },
    { subject: 'Overthinking', value: data.personality_insights?.overthinking || 50, fullMark: 100 },
    { subject: 'Risk Tolerance', value: data.personality_insights?.risk_tolerance || 50, fullMark: 100 }
  ];

  const getRegretColor = (prob) => {
    if (prob < 40) return 'text-neon-teal';
    if (prob < 70) return 'text-neon-amber';
    return 'text-neon-pink';
  };

  const getRegretBg = (prob) => {
    if (prob < 40) return 'bg-neon-teal/10 border-neon-teal/20';
    if (prob < 70) return 'bg-neon-amber/10 border-neon-amber/20';
    return 'bg-neon-pink/10 border-neon-pink/20';
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Analyze a different decision
          </button>
          <h2 className="text-3xl font-extrabold text-white mt-1">{data.title}</h2>
          <p className="text-sm text-gray-400 mt-1 italic">"{data.input_text}"</p>
        </div>
        
        <button
          onClick={onReset}
          className="px-4 py-2 rounded-xl bg-dark-border border border-white/10 hover:border-white/20 text-gray-300 hover:text-white text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Reset Simulator
        </button>
      </div>

      {/* Highlights Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Regret Probability */}
        <div className={`glass-panel p-5 rounded-2xl border ${getRegretBg(data.regret_probability)}`}>
          <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Regret Probability</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className={`text-4xl font-extrabold ${getRegretColor(data.regret_probability)}`}>
              {Math.round(data.regret_probability)}%
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Likelihood of feeling future remorse</p>
        </div>

        {/* Expected Satisfaction */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Future Satisfaction</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-4xl font-extrabold text-neon-teal">
              {Math.round(data.satisfaction_score)}%
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Average long-term happiness rating</p>
        </div>

        {/* Stress Prediction */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Stress Outlook</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-4xl font-extrabold text-neon-pink">
              {data.stress_prediction}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Predicted chronic anxiety density</p>
        </div>

        {/* Emotional Stability */}
        <div className="glass-panel p-5 rounded-2xl border border-white/5">
          <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Emotional Stability</span>
          <div className="flex items-baseline gap-1 mt-2">
            <span className="text-4xl font-extrabold text-neon-purple">
              {data.emotional_stability}
            </span>
          </div>
          <p className="text-[11px] text-gray-500 mt-2">Emotional resilience over paths</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('timelines')}
          className={`pb-4 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'timelines' ? 'text-neon-teal' : 'text-gray-400 hover:text-white'
          }`}
        >
          Timeline Simulations
          {activeTab === 'timelines' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-teal" />}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-4 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'analytics' ? 'text-neon-teal' : 'text-gray-400 hover:text-white'
          }`}
        >
          Graphical Analytics
          {activeTab === 'analytics' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-teal" />}
        </button>
        <button
          onClick={() => setActiveTab('swot')}
          className={`pb-4 text-sm font-semibold transition relative cursor-pointer ${
            activeTab === 'swot' ? 'text-neon-teal' : 'text-gray-400 hover:text-white'
          }`}
        >
          SWOT & Insights
          {activeTab === 'swot' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-teal" />}
        </button>
      </div>

      {/* Main Tab Contents */}
      {activeTab === 'timelines' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Timeline A - Change */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-neon-purple/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-purple/5 rounded-full filter blur-xl" />
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-purple" />
              {data.timeline_a?.name || "Timeline A"}
            </h3>
            
            <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
              {data.timeline_a?.milestones?.map((milestone, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline point */}
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-neon-purple border-4 border-[#0b0b0f] glow-shadow-purple" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neon-purple uppercase tracking-wider">{milestone.time}</span>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>Satisf. <strong className="text-neon-teal">{Math.round(milestone.satisfaction)}%</strong></span>
                      <span>Stress <strong className="text-neon-pink">{Math.round(milestone.stress)}%</strong></span>
                    </div>
                  </div>
                  <p className="text-sm font-light text-gray-300 mt-1">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline B - Status Quo */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden border border-neon-teal/20">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-teal/5 rounded-full filter blur-xl" />
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-teal" />
              {data.timeline_b?.name || "Timeline B"}
            </h3>
            
            <div className="relative border-l border-white/10 pl-6 ml-3 space-y-8">
              {data.timeline_b?.milestones?.map((milestone, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline point */}
                  <span className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-neon-teal border-4 border-[#0b0b0f] glow-shadow-teal" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-neon-teal uppercase tracking-wider">{milestone.time}</span>
                    <div className="flex gap-3 text-xs text-gray-400">
                      <span>Satisf. <strong className="text-neon-teal">{Math.round(milestone.satisfaction)}%</strong></span>
                      <span>Stress <strong className="text-neon-pink">{Math.round(milestone.stress)}%</strong></span>
                    </div>
                  </div>
                  <p className="text-sm font-light text-gray-300 mt-1">{milestone.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Regret Probability Curves */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-neon-teal" />
              Regret Probability Projection Curves
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cleanLineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                  <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} unit="%" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161621', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="Timeline A (Change)" 
                    stroke="#9d4edd" 
                    strokeWidth={3} 
                    activeDot={{ r: 8 }} 
                    dot={{ stroke: '#9d4edd', strokeWidth: 2, r: 4 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Timeline B (Status Quo)" 
                    stroke="#00f5d4" 
                    strokeWidth={3} 
                    dot={{ stroke: '#00f5d4', strokeWidth: 2, r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bar Chart comparing 6 Months stress/satisfaction */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-4">6-Month Outcome Comparison</h3>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={12} unit="%" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#161621', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}
                    />
                    <Legend />
                    <Bar dataKey="Satisfaction" fill="#00f5d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Stress" fill="#ff007f" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Radar Chart for current emotional state */}
            <div className="glass-panel p-6 rounded-2xl">
              <h3 className="text-md font-bold text-white mb-4">Psychological Footprint Map</h3>
              <div className="w-full h-64 flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" radius="70%" data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255,255,255,0.15)" fontSize={8} />
                    <Radar name="Decision Profile" dataKey="value" stroke="#9d4edd" fill="#9d4edd" fillOpacity={0.25} />
                    <Tooltip contentStyle={{ backgroundColor: '#161621', borderColor: 'rgba(255,255,255,0.1)' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'swot' && (
        <div className="space-y-8">
          {/* AI Recommendation Summary */}
          <div className="glass-panel p-6 rounded-2xl relative border border-white/10 overflow-hidden bg-gradient-to-r from-[#12121c] to-[#1a132e]">
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-neon-amber" />
              Strategic Recommendation
            </h3>
            <p className="text-sm font-light leading-relaxed text-gray-300">
              {data.summary_recommendation}
            </p>
          </div>

          {/* SWOT Grid */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">Decision SWOT Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-neon-teal">
                <span className="text-xs font-bold text-neon-teal uppercase tracking-wider block mb-2">Strengths (Option A)</span>
                <ul className="space-y-1.5 text-sm text-gray-300 font-light list-inside list-disc">
                  {data.swot_analysis?.strengths?.map((s, i) => <li key={i}>{s}</li>) || <li>No analysis found</li>}
                </ul>
              </div>

              {/* Weaknesses */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-neon-pink">
                <span className="text-xs font-bold text-neon-pink uppercase tracking-wider block mb-2">Weaknesses (Option A)</span>
                <ul className="space-y-1.5 text-sm text-gray-300 font-light list-inside list-disc">
                  {data.swot_analysis?.weaknesses?.map((w, i) => <li key={i}>{w}</li>) || <li>No analysis found</li>}
                </ul>
              </div>

              {/* Opportunities */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-neon-purple">
                <span className="text-xs font-bold text-neon-purple uppercase tracking-wider block mb-2">Opportunities (Future)</span>
                <ul className="space-y-1.5 text-sm text-gray-300 font-light list-inside list-disc">
                  {data.swot_analysis?.opportunities?.map((o, i) => <li key={i}>{o}</li>) || <li>No analysis found</li>}
                </ul>
              </div>

              {/* Threats */}
              <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-neon-amber">
                <span className="text-xs font-bold text-neon-amber uppercase tracking-wider block mb-2">Threats (Risks)</span>
                <ul className="space-y-1.5 text-sm text-gray-300 font-light list-inside list-disc">
                  {data.swot_analysis?.threats?.map((t, i) => <li key={i}>{t}</li>) || <li>No analysis found</li>}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
