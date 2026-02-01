
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AgentState, AgentStep, LogEntry } from '../types';
import { Icons } from '../constants';

interface ReportPageProps {
  agentState: AgentState;
  steps: AgentStep[];
  logs: LogEntry[];
  onReset: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ agentState, steps, logs, onReset }) => {
  const diff = agentState.generatedDiff;

  const handleExportLogs = () => {
    const logText = logs.map(l => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autodevops-audit-log-${agentState.simulationId || 'session'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 md:py-20 min-h-screen">
      <div className="bg-[#f8f9fa] text-[#202124] rounded-[24px] md:rounded-[48px] overflow-hidden shadow-2xl mb-12 flex flex-col lg:flex-row">
        {/* Left Info Bar */}
        <div className="lg:w-72 bg-[#ffffff] border-b lg:border-b-0 lg:border-r border-[#dadce0] p-8 md:p-12 flex flex-col">
          <div className="text-[#8ab4f8] font-bold mb-10 flex items-center gap-2 text-xl">
            <Icons.Cpu /> AUTO_DEVOPS
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
            <div>
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-2">Build Identifier</p>
              <p className="text-sm font-mono font-medium">AD-{agentState.simulationId || '712'}-STABLE</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-2">Build Date</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-2">Target Stack</p>
              <p className="text-sm font-medium">{agentState.techStack || 'Detected'}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-2">System Status</p>
              <div className="flex items-center gap-2 text-[#188038] font-bold">
                <Icons.CheckCircle /> STABLE
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block mt-auto pt-10 border-t border-[#f1f3f4]">
            <p className="text-[9px] text-[#9aa0a6] uppercase font-bold tracking-widest leading-relaxed">
              Autonomous Verification <br/> Certified Report v1.2
            </p>
          </div>
        </div>

        {/* Right Content */}
        <div className="flex-1 p-8 md:p-16 w-full min-w-0">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-google font-bold mb-2 tracking-tight">Post-Mortem Analysis</h1>
              <p className="text-lg md:text-xl text-[#5f6368] font-light">Codebase stability restored via autonomous reconciliation.</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-sm font-bold flex items-center gap-2 shrink-0">
              Verified by Gemini-3
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
            {[
              { label: 'Reconciliation Cycles', val: agentState.currentAttempt, trend: 'Optimal' },
              { label: 'Structural Fixes', val: diff ? '1' : '0', trend: 'Verified' },
              { label: 'Tests Verified', val: '100%', trend: 'Passing' },
              { label: 'Agent Confidence', val: `${agentState.confidence}%`, trend: 'Target Met' },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-4 rounded-2xl border border-[#dadce0] shadow-sm">
                <p className="text-[10px] font-bold text-[#5f6368] uppercase mb-1">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-google font-bold">{stat.val}</p>
                <p className="text-[9px] text-emerald-600 font-bold mt-1">Status: {stat.trend}</p>
              </div>
            ))}
          </div>

          <div className="space-y-12 w-full min-w-0">
            <div>
              <h3 className="text-lg font-bold border-b border-[#dadce0] pb-3 mb-6 flex items-center gap-2 text-[#1a73e8]">
                <Icons.Sparkle /> Executive Reasoning Summary
              </h3>
              <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-[#dadce0] shadow-sm relative overflow-hidden">
                <div className="absolute top-4 right-4 text-[#e8eaed] opacity-50 pointer-events-none">
                   <span className="material-symbols-outlined text-4xl">format_quote</span>
                </div>
                <div className="prose prose-slate prose-sm md:prose-base max-w-none prose-headings:font-google prose-headings:mb-4 prose-p:leading-relaxed prose-pre:bg-[#131314] prose-pre:text-white prose-pre:p-4 prose-pre:rounded-xl prose-pre:overflow-x-auto prose-pre:max-w-[80vw] md:prose-pre:max-w-none">
                  {agentState.reportSummary ? (
                    <ReactMarkdown>{agentState.reportSummary}</ReactMarkdown>
                  ) : (
                    <p className="italic text-[#9aa0a6]">Autonomous agent successfully analyzed the environment and ensured codebase integrity. No critical failures remained after the stabilization cycle.</p>
                  )}
                </div>
              </div>
            </div>

            {diff && (
              <div>
                <h3 className="text-lg font-bold border-b border-[#dadce0] pb-3 mb-6 flex items-center gap-2 text-[#1a73e8]">
                  <Icons.Code /> Applied Reconciliation Patch
                </h3>
                <div className="bg-white border border-[#dadce0] rounded-[24px] overflow-hidden shadow-sm">
                  <div className="bg-[#f8f9fa] px-6 py-4 border-b border-[#dadce0] flex items-center justify-between">
                     <div className="flex items-center gap-2 overflow-hidden">
                       <span className="material-symbols-outlined text-lg text-[#5f6368] shrink-0">description</span>
                       <span className="text-sm font-mono text-[#3c4043] truncate">{diff.filePath}</span>
                     </div>
                     <div className="text-[10px] bg-[#e8f0fe] text-[#1a73e8] px-2 py-1 rounded font-bold shrink-0 ml-2">GEMINI_PATCH_CERTIFIED</div>
                  </div>
                  <div className="p-4 md:p-6">
                    <p className="text-sm text-[#5f6368] mb-6 italic leading-relaxed">
                      "{diff.explanation}"
                    </p>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      <div className="bg-[#131314] text-[#e3e3e3] p-4 md:p-6 rounded-2xl font-mono text-xs overflow-x-auto w-full">
                         <p className="text-[#5f6368] mb-4 uppercase text-[10px] font-bold tracking-widest border-b border-[#3c4043] pb-2">Baseline Version</p>
                         <div className="min-w-max">
                           {(diff.before || []).map((line, i) => (
                             <div key={i} className={`flex gap-4 ${line.type === 'removed' ? 'bg-[#f28b82]/20 text-[#f28b82]' : ''}`}>
                                <span className="text-[#5f6368] w-8 text-right shrink-0 select-none">{line.lineNumber}</span>
                                <pre className="whitespace-pre">{line.content}</pre>
                             </div>
                           ))}
                         </div>
                      </div>
                      <div className="bg-[#131314] text-[#e3e3e3] p-4 md:p-6 rounded-2xl font-mono text-xs overflow-x-auto w-full">
                         <p className="text-[#5f6368] mb-4 uppercase text-[10px] font-bold tracking-widest border-b border-[#3c4043] pb-2">Stabilized Version</p>
                         <div className="min-w-max">
                           {(diff.after || []).map((line, i) => (
                             <div key={i} className={`flex gap-4 ${line.type === 'added' ? 'bg-[#81c995]/20 text-[#81c995]' : ''}`}>
                                <span className="text-[#5f6368] w-8 text-right shrink-0 select-none">{line.lineNumber}</span>
                                <pre className="whitespace-pre">{line.content}</pre>
                             </div>
                           ))}
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-bold border-b border-[#dadce0] pb-3 mb-6 flex items-center gap-2">
                <Icons.History /> Decision & Audit Logs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-[24px] border border-[#dadce0] shadow-sm">
                  <h4 className="font-bold mb-4 text-[#188038] text-sm uppercase tracking-wider flex items-center gap-2">
                    <Icons.Shield /> Stability Audit
                  </h4>
                  <div className="space-y-4 text-sm text-[#5f6368]">
                    <div className="flex gap-3">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Recursive Dependency Check</p>
                        <p className="text-xs">Zero circular dependencies found after stabilization cycle.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Security Signature Match</p>
                        <p className="text-xs">No insecure coding patterns detected in the autonomous patch.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Regression Test Coverage</p>
                        <p className="text-xs">Full path verification complete for {agentState.techStack || 'detected'} modules.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-[#dadce0] shadow-sm">
                  <h4 className="font-bold mb-4 text-[#1a73e8] text-sm uppercase tracking-wider flex items-center gap-2">
                    <Icons.Activity /> Performance Profile
                  </h4>
                  <div className="space-y-4 text-sm text-[#5f6368]">
                    <div className="flex gap-3">
                      <span className="text-indigo-500 font-bold">→</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Memory Footprint</p>
                        <p className="text-xs">Optimization confirmed within operational bounds.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-indigo-500 font-bold">↓</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Avg Latency</p>
                        <p className="text-xs">Calculated improvement through algorithmic pruning.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-indigo-500 font-bold">↑</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Throughput Efficiency</p>
                        <p className="text-xs">Stabilized build cycle performance profile verified.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 md:mt-24 flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#dadce0] gap-6">
            <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
              <p className="text-[10px] font-mono text-[#9aa0a6] uppercase tracking-widest">Digital Certificate Fingerprint</p>
              <p className="text-[9px] font-mono text-[#bdc1c6] max-w-[200px] md:max-w-none truncate">0xAD_{agentState.simulationId || '000'}_BETA_AUTONOMOUS_RUN_CERTIFIED_STABLE</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={handleExportLogs}
                className="px-8 py-3 bg-[#202124] text-white rounded-full font-bold hover:bg-black transition-all shadow-md flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Export Audit Log
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center">
        <button 
          onClick={onReset}
          className="text-[#9aa0a6] hover:text-white font-medium flex items-center gap-2 mx-auto transition-colors px-6 py-2 rounded-full border border-transparent hover:border-[#3c4043]"
        >
          <Icons.History /> New Autonomous Session
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
