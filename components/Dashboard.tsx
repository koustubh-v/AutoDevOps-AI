import React, { useState } from 'react';
import { AgentStep, LogEntry, AgentState } from '../types';
import { Icons } from '../constants';

interface DashboardProps {
  steps: AgentStep[];
  logs: LogEntry[];
  agentState: AgentState;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ steps, logs, agentState, onLogout }) => {
  const isRunning = steps?.some(step => step.status === 'running');
  const [activeTab, setActiveTab] = useState<'logs' | 'issues' | 'diff'>('logs');

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#131314]">
      {/* Header */}
      <header className="shrink-0 h-16 border-b border-[#3c4043] bg-[#1e1f20] px-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-6">
          <div className="text-[#8ab4f8] flex items-center gap-3">
            <Icons.Cpu />
            <h1 className="text-lg font-google font-bold text-white tracking-tight uppercase">AutoDevOps AI <span className="text-[#5f6368] font-mono text-[10px] ml-2">v3.0.0-PRO</span></h1>
          </div>
          <div className="h-4 w-px bg-[#3c4043]"></div>
          <div className="text-[10px] font-mono text-[#9aa0a6] flex items-center gap-6">
            <span className="flex items-center gap-2"><span className="text-[#5f6368]">SID:</span> {agentState.simulationId}</span>
            <span className="flex items-center gap-2"><span className="text-[#5f6368]">TSIG:</span> {agentState.thoughtSignature}</span>
            <span className="text-white bg-[#8ab4f8]/10 px-2 py-0.5 rounded border border-[#8ab4f8]/20">{agentState.branch}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 px-4 py-1.5 bg-[#1e1f20] border border-[#3c4043] rounded-full">
            <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-[#81c995] animate-pulse shadow-[0_0_8px_rgba(129,201,149,0.5)]' : 'bg-[#5f6368]'}`}></span>
            <span className="text-[10px] font-bold text-[#bdc1c6] uppercase tracking-wider">{isRunning ? 'Architectural Reconciliation' : 'Verified Stable'}</span>
          </div>
          <button onClick={onLogout} className="text-[#9aa0a6] hover:text-[#f28b82] transition-colors flex items-center gap-2 text-xs font-bold uppercase">
            Exit <span className="material-symbols-outlined text-sm">logout</span>
          </button>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {/* Progress Sidebar */}
        <aside className="w-80 border-r border-[#3c4043] bg-[#131314] p-8 flex flex-col gap-10">
           <div>
             <h2 className="text-[10px] font-bold text-[#5f6368] uppercase tracking-[0.2em] mb-6">Stabilization Pipeline</h2>
             <div className="space-y-4">
               {steps.map(step => (
                 <div key={step.id} className={`flex items-start gap-4 p-4 rounded-2xl transition-all ${step.status === 'running' ? 'bg-[#1e1f20] ring-1 ring-[#8ab4f8]/30 shadow-2xl' : ''}`}>
                   <div className={`mt-1 ${step.status === 'success' ? 'text-[#81c995]' : step.status === 'running' ? 'text-[#8ab4f8]' : 'text-[#5f6368]'}`}>
                     {step.status === 'success' ? <Icons.CheckCircle /> : step.status === 'running' ? <Icons.Activity /> : <Icons.History />}
                   </div>
                   <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-tight">{step.label}</p>
                      <p className="text-[9px] text-[#5f6368] uppercase font-bold tracking-tight mt-1">{step.status}</p>
                   </div>
                 </div>
               ))}
             </div>
           </div>
           
           <div className="mt-auto space-y-4">
              <div className="p-5 bg-[#8ab4f8]/5 border border-[#8ab4f8]/10 rounded-3xl">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-[10px] font-bold text-[#8ab4f8] uppercase tracking-widest">Reconciliation Progress</p>
                  <p className="text-xs font-mono text-white">{agentState.confidence}%</p>
                </div>
                <div className="w-full h-1.5 bg-[#1e1f20] rounded-full overflow-hidden">
                  <div className="h-full bg-[#8ab4f8] transition-all duration-1000 shadow-[0_0_10px_rgba(138,180,248,0.4)]" style={{ width: `${agentState.confidence}%` }}></div>
                </div>
              </div>
           </div>
        </aside>

        {/* Console / Workspace */}
        <section className="flex-1 flex flex-col bg-[#0b0c0d]">
          <div className="h-14 border-b border-[#3c4043] bg-[#1e1f20] flex items-center px-8 gap-10">
            <button onClick={() => setActiveTab('logs')} className={`h-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'logs' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#5f6368]'}`}>Trace Logs</button>
            <button onClick={() => setActiveTab('issues')} className={`h-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'issues' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#5f6368]'}`}>Detected Vulnerabilities ({agentState.issues?.length || 0})</button>
            <button onClick={() => setActiveTab('diff')} className={`h-full flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === 'diff' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#5f6368]'}`}>Reconciliation Patch</button>
          </div>

          <div className="flex-1 overflow-y-auto p-10">
            {activeTab === 'logs' && (
              <div className="font-mono text-[11px] leading-relaxed space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="flex gap-6 items-start group">
                    <span className="text-[#3c4043] w-20 shrink-0 font-bold">{log.timestamp}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${log.type === 'error' ? 'bg-[#f28b82]/10 text-[#f28b82]' : log.type === 'audit' ? 'bg-[#81c995]/10 text-[#81c995]' : 'bg-[#8ab4f8]/10 text-[#8ab4f8]'}`}>{log.type}</span>
                    <span className="text-[#bdc1c6] group-hover:text-white transition-colors">{log.message}</span>
                  </div>
                ))}
                {isRunning && <div className="flex gap-6 items-start animate-pulse"><span className="text-[#3c4043] w-20 shrink-0">--:--:--</span><span className="text-[#8ab4f8] font-black uppercase text-[9px]">REASONING</span><span className="text-[#5f6368]">Synthesizing architectural stabilization strategy...</span></div>}
              </div>
            )}

            {activeTab === 'issues' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {agentState.issues?.map(issue => (
                  <div key={issue.id} className="bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-8 flex flex-col gap-6 group hover:border-[#8ab4f8]/40 transition-all shadow-xl">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${issue.severity === 'Critical' ? 'bg-[#f28b82] text-white' : 'bg-[#fdd663] text-black'}`}>{issue.severity}</span>
                        <h4 className="font-bold text-white text-base tracking-tight">{issue.title}</h4>
                      </div>
                      {issue.status === 'resolved' ? (
                        <div className="text-[#81c995]"><Icons.CheckCircle /></div>
                      ) : issue.status === 'fixing' ? (
                        <div className="text-[#8ab4f8] animate-spin"><Icons.Activity /></div>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#9aa0a6] leading-relaxed font-light">{issue.description}</p>
                    <div className="mt-auto pt-6 border-t border-[#3c4043] flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#8ab4f8]">
                          <span className="material-symbols-outlined text-sm">description</span>
                          {issue.file}
                        </div>
                        <span className="text-[10px] font-black text-[#5f6368] uppercase tracking-widest">{issue.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {!agentState.issues?.length && <div className="col-span-full py-48 text-center opacity-30 font-google"><Icons.Activity /><p className="mt-4 text-xl">Allocating 1M token reasoning budget for selective context audit...</p></div>}
              </div>
            )}

            {activeTab === 'diff' && (
              <div className="h-full flex flex-col gap-8">
                {agentState.generatedDiff ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-[#8ab4f8] uppercase mb-2">Root Cause Narrative</p>
                        <p className="text-xs text-white leading-relaxed">{agentState.generatedDiff.rootCause}</p>
                      </div>
                      <div className="bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-[#8ab4f8] uppercase mb-2">Impact Radius</p>
                        <div className="flex flex-wrap gap-2">
                          {agentState.generatedDiff.impactRadius.map(f => (
                            <span key={f} className="text-[9px] font-mono bg-[#131314] px-2 py-1 rounded text-[#9aa0a6] border border-[#3c4043]">{f}</span>
                          ))}
                        </div>
                      </div>
                      <div className="bg-[#1e1f20] border border-[#3c4043] rounded-3xl p-6">
                        <p className="text-[10px] font-bold text-[#8ab4f8] uppercase mb-2">Verification Strategy</p>
                        <p className="text-xs text-white leading-relaxed">{agentState.generatedDiff.verificationStrategy}</p>
                      </div>
                    </div>

                    <div className="bg-[#1e1f20] border border-[#3c4043] rounded-[40px] overflow-hidden flex-1 flex flex-col shadow-2xl">
                      <div className="px-10 py-6 bg-[#2d2e30] border-b border-[#3c4043] flex justify-between items-center">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-[#8ab4f8]/10 rounded-xl text-[#8ab4f8]"><Icons.Code /></div>
                          <span className="font-mono text-xs text-white">{agentState.generatedDiff.filePath}</span>
                        </div>
                        <span className="text-[10px] font-black bg-[#8ab4f8] text-[#131314] px-4 py-1.5 rounded-full uppercase tracking-widest">Reconciliation Patch Certified</span>
                      </div>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                        <div className="p-10 overflow-auto bg-[#0b0c0d] font-mono text-[11px] border-r border-[#3c4043]">
                          <div className="text-[9px] font-black text-[#5f6368] uppercase tracking-widest mb-6 pb-2 border-b border-[#3c4043]">Recursive Trace: Pre-Reconciliation</div>
                          {agentState.generatedDiff.before.map((l, i) => (
                            <div key={i} className={`flex gap-6 py-0.5 ${l.type === 'removed' ? 'bg-[#f28b82]/10 text-[#f28b82] ring-1 ring-[#f28b82]/20' : ''}`}>
                              <span className="text-[#3c4043] w-10 text-right shrink-0">{l.lineNumber}</span>
                              <pre className="whitespace-pre">{l.content}</pre>
                            </div>
                          ))}
                        </div>
                        <div className="p-10 overflow-auto bg-[#0b0c0d] font-mono text-[11px]">
                          <div className="text-[9px] font-black text-[#81c995] uppercase tracking-widest mb-6 pb-2 border-b border-[#3c4043]">Stabilized Codebase State</div>
                          {agentState.generatedDiff.after.map((l, i) => (
                            <div key={i} className={`flex gap-6 py-0.5 ${l.type === 'added' ? 'bg-[#81c995]/10 text-[#81c995] ring-1 ring-[#81c995]/20' : ''}`}>
                              <span className="text-[#3c4043] w-10 text-right shrink-0">{l.lineNumber}</span>
                              <pre className="whitespace-pre">{l.content}</pre>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                ) : <div className="h-full flex flex-col items-center justify-center opacity-30 gap-6">
                      <div className="scale-[4]"><Icons.Code /></div>
                      <p className="font-google text-2xl tracking-tight">Synthesizing global reconciliation patch...</p>
                    </div>}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
