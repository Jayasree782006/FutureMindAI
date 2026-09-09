import React from 'react';
import { Trash2, CheckCircle2, AlertTriangle, HelpCircle, Smile, Calendar, History, ArrowRight } from 'lucide-react';

const HistoryDashboard = ({ decisions, onSelect, onDelete, onResolve }) => {
  const getRegretColor = (prob) => {
    if (prob < 40) return 'text-neon-teal';
    if (prob < 70) return 'text-neon-amber';
    return 'text-neon-pink';
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'happy':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-neon-teal/10 border border-neon-teal/20 text-neon-teal flex items-center gap-1 font-bold"><Smile className="w-3 h-3" /> Satisfied</span>;
      case 'regret':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-neon-pink/10 border border-neon-pink/20 text-neon-pink flex items-center gap-1 font-bold"><AlertTriangle className="w-3 h-3" /> Regretted</span>;
      case 'neutral':
        return <span className="px-2 py-0.5 rounded text-[10px] bg-neon-amber/10 border border-neon-amber/20 text-neon-amber flex items-center gap-1 font-bold"><HelpCircle className="w-3 h-3" /> Neutral</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-gray-400 flex items-center gap-1">Unresolved</span>;
    }
  };

  // Compute summary stats
  const totalDecisions = decisions.length;
  const avgRegret = totalDecisions > 0 
    ? Math.round(decisions.reduce((acc, d) => acc + d.regret_probability, 0) / totalDecisions) 
    : 0;

  const resolved = decisions.filter(d => d.actual_regret_status !== 'unresolved');
  const happyCount = resolved.filter(d => d.actual_regret_status === 'happy').length;
  const neutralCount = resolved.filter(d => d.actual_regret_status === 'neutral').length;
  const regretCount = resolved.filter(d => d.actual_regret_status === 'regret').length;

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Overview stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Logged Decisions</span>
          <span className="text-3xl font-extrabold text-white mt-1 block">{totalDecisions}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Avg. Predicted Regret</span>
          <span className="text-3xl font-extrabold text-neon-purple mt-1 block">{avgRegret}%</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Resolved Decisions</span>
          <span className="text-3xl font-extrabold text-neon-teal mt-1 block">{resolved.length}</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/5">
          <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Post-Choice Regret Rate</span>
          <span className="text-3xl font-extrabold text-neon-pink mt-1 block">
            {resolved.length > 0 ? Math.round((regretCount / resolved.length) * 100) : 0}%
          </span>
        </div>
      </div>

      {decisions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-white/5 text-center flex flex-col items-center gap-4">
          <History className="w-12 h-12 text-gray-600 animate-pulse" />
          <h3 className="text-lg font-bold text-gray-300">No Decision Logs Yet</h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Once you submit decisions in the Quantum Console, they will be archived here to track predicted vs. actual outcomes.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-neon-purple" />
            Decision Intelligence Logs
          </h3>

          <div className="space-y-4">
            {decisions.map((decision) => (
              <div 
                key={decision.id}
                className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div 
                  onClick={() => onSelect(decision)}
                  className="flex-1 cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-white text-base hover:text-neon-teal transition">{decision.title}</h4>
                    {getStatusBadge(decision.actual_regret_status)}
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-1 italic">"{decision.input_text}"</p>
                  <div className="flex items-center gap-4 text-[10px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(decision.created_at).toLocaleDateString()}
                    </span>
                    <span>
                      Predicted Regret: <strong className={getRegretColor(decision.regret_probability)}>{Math.round(decision.regret_probability)}%</strong>
                    </span>
                    <span>
                      Satisfaction: <strong className="text-neon-teal">{Math.round(decision.satisfaction_score)}%</strong>
                    </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                  {decision.actual_regret_status === 'unresolved' ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-gray-500 mr-1">Resolve:</span>
                      <button 
                        onClick={() => onResolve(decision.id, 'happy')}
                        className="px-2 py-1 rounded bg-neon-teal/10 hover:bg-neon-teal text-neon-teal hover:text-black text-xs transition font-semibold cursor-pointer"
                      >
                        Happy
                      </button>
                      <button 
                        onClick={() => onResolve(decision.id, 'neutral')}
                        className="px-2 py-1 rounded bg-neon-amber/10 hover:bg-neon-amber text-neon-amber hover:text-black text-xs transition font-semibold cursor-pointer"
                      >
                        Neutral
                      </button>
                      <button 
                        onClick={() => onResolve(decision.id, 'regret')}
                        className="px-2 py-1 rounded bg-neon-pink/10 hover:bg-neon-pink text-neon-pink hover:text-black text-xs transition font-semibold cursor-pointer"
                      >
                        Regret
                      </button>
                    </div>
                  ) : (
                    <div className="text-[10px] text-gray-500">
                      Outcome Locked
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelect(decision)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-neon-teal/20 text-gray-300 hover:text-neon-teal transition cursor-pointer"
                      title="Load Analytics Dashboard"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(decision.id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-neon-pink/20 text-gray-300 hover:text-neon-pink transition cursor-pointer"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryDashboard;
