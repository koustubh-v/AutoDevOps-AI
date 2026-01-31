
import React, { useState } from 'react';
import { AgentStep, LogEntry, AgentState, CodeFix } from '../types';
import { Icons, MOCK_DIFF } from '../constants';

interface DashboardProps {
  steps: AgentStep[];
  logs: LogEntry[];
  agentState: AgentState;
}

const Dashboard: React.FC<DashboardProps> = ({ steps, logs, agentState }) => {
  const [activeTab, setActiveTab] = useState<'logs' | 'diff'>('logs');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#131314]">
      {/* Google-Style Header */}
      <header className="shrink-0 h-16 border-b border-[#3c4043] bg-[#1e1f20] px-4 md:px-6 flex items-center justify-between z-30">
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-[#8ab4f8] hover:bg-[#3c4043] p-2 rounded-full transition-colors lg:hidden flex items-center justify-center"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="text-[#8ab4f8] hidden sm:block">
              <Icons.Cpu />
            </div>
            <h1 className="text-lg md:text-xl font-google font-medium text-[#e3e3e3]">AutoDevOps</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2 px-3 md:px-4 py-1.5 bg-[#1e1f20] border border-[#3c4043] rounded-full">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#81c995] animate-pulse"></span>
            <span className="text-[10px] md:text-xs font-medium text-[#81c995]">RUNNING: AD-712</span>
          </div>
          <button 
            onClick={() => setIsRightPanelOpen(!isRightPanelOpen)}
            className="lg:hidden text-[#9aa0a6] p-2 hover:bg-[#3c4043] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">info</span>
          </button>
          <div className="w-8 h-8 rounded-full bg-[#8ab4f8] text-[#131314] hidden sm:flex items-center justify-center font-bold text-sm">
            G
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left Nav: Steps (Responsive Sidebar) */}
        <aside className={`
          fixed lg:relative inset-y-0 left-0 w-72 md:w-80 border-r border-[#3c4043] bg-[#131314] z-40 transition-transform duration-300 lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="h-full flex flex-col p-4">
            <div className="flex lg:hidden justify-between items-center mb-6 px-2">
              <span className="text-sm font-bold text-[#9aa0a6] uppercase">Pipeline</span>
              <button onClick={() => setIsSidebarOpen(false)} className="text-[#9aa0a6] p-1">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-2">
              <h2 className="text-xs font-bold text-[#9aa0a6] uppercase tracking-[1px] mb-4 hidden lg:block">Pipeline Status</h2>
              <div className="space-y-1">
                {steps.map((step) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${step.status === 'running' ? 'bg-[#1e1f20] text-[#8ab4f8]' : 'text-[#e3e3e3]'}`}
                  >
                    <div className={`shrink-0 flex items-center justify-center ${
                      step.status === 'success' ? 'text-[#81c995]' : 
                      step.status === 'failed' ? 'text-[#f28b82]' : 
                      step.status === 'running' ? 'text-[#8ab4f8]' : 'text-[#5f6368]'
                    }`}>
                      {step.status === 'success' ? <Icons.CheckCircle /> : 
                       step.status === 'running' ? <Icons.Activity /> : <Icons.History />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{step.label}</p>
                      <p className="text-[10px] text-[#9aa0a6] truncate">{step.status.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Sidebar Overlay */}
        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" />}

        {/* Center: Work Area */}
        <section className="flex-1 flex flex-col bg-[#0b0b0b] overflow-hidden">
          {/* Tabs */}
          <div className="h-12 border-b border-[#3c4043] bg-[#1e1f20] flex items-center px-4 md:px-6 gap-4 md:gap-8">
            <button 
              onClick={() => setActiveTab('logs')}
              className={`h-full flex items-center gap-2 text-xs md:text-sm font-medium transition-colors border-b-2 ${activeTab === 'logs' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
            >
              <Icons.Terminal /> Logs
            </button>
            <button 
              onClick={() => setActiveTab('diff')}
              className={`h-full flex items-center gap-2 text-xs md:text-sm font-medium transition-colors border-b-2 ${activeTab === 'diff' ? 'border-[#8ab4f8] text-[#8ab4f8]' : 'border-transparent text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
            >
              <Icons.Code /> Code Diff
            </button>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            {activeTab === 'logs' ? (
              <div className="p-4 md:p-6 font-mono text-xs md:text-sm space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-2 md:gap-4 group">
                    <span className="text-[#5f6368] shrink-0 text-[10px] md:text-[11px] pt-1 w-12 md:w-20">{log.timestamp}</span>
                    <div className="flex-1">
                      <span className={`uppercase text-[9px] md:text-[10px] font-bold mr-2 md:mr-3 ${
                        log.type === 'error' ? 'text-[#f28b82]' : 
                        log.type === 'test' ? 'text-[#8ab4f8]' : 
                        log.type === 'reasoning' ? 'text-[#81c995]' : 'text-[#9aa0a6]'
                      }`}>
                        {log.type}
                      </span>
                      <span className={log.type === 'reasoning' ? 'text-[#8ab4f8] italic' : 'text-[#e3e3e3]'}>
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 md:p-8">
                <div className="bg-[#1e1f20] border border-[#3c4043] rounded-[16px] md:rounded-[24px] overflow-hidden">
                  <div className="bg-[#2d2e30] px-4 md:px-6 py-3 md:py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Icons.Code />
                      <span className="text-xs md:text-sm font-mono text-[#e3e3e3] truncate max-w-[200px]">{MOCK_DIFF.filePath}</span>
                    </div>
                    <span className="text-[10px] bg-[#8ab4f8] text-[#131314] px-2 py-0.5 rounded font-bold uppercase">Applied Patch</span>
                  </div>
                  <div className="p-4 md:p-6">
                    <p className="text-[#bdc1c6] text-xs md:text-sm mb-6 leading-relaxed bg-[#131314] p-3 md:p-4 rounded-xl border border-[#3c4043]">
                      <Icons.Sparkle /> <span className="ml-2 font-medium">AI Diagnosis:</span> {MOCK_DIFF.explanation}
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-[#3c4043] border border-[#3c4043]">
                      <div className="bg-[#131314] p-3 md:p-4 font-mono text-[10px] md:text-xs overflow-x-auto">
                        <p className="text-[#9aa0a6] mb-4 border-b border-[#3c4043] pb-2 uppercase tracking-widest text-[9px] md:text-[10px]">BEFORE</p>
                        {MOCK_DIFF.before.map((line, i) => (
                          <div key={i} className={`flex gap-2 md:gap-4 ${line.type === 'removed' ? 'bg-[#f28b82]20 text-[#f28b82]' : ''}`}>
                            <span className="text-[#5f6368] w-6 md:w-8 text-right shrink-0">{line.lineNumber}</span>
                            <pre className="whitespace-pre">{line.content}</pre>
                          </div>
                        ))}
                      </div>
                      <div className="bg-[#131314] p-3 md:p-4 font-mono text-[10px] md:text-xs overflow-x-auto border-t md:border-t-0 border-[#3c4043]">
                        <p className="text-[#9aa0a6] mb-4 border-b border-[#3c4043] pb-2 uppercase tracking-widest text-[9px] md:text-[10px]">AFTER</p>
                        {MOCK_DIFF.after.map((line, i) => (
                          <div key={i} className={`flex gap-2 md:gap-4 ${line.type === 'added' ? 'bg-[#81c995]20 text-[#81c995]' : ''}`}>
                            <span className="text-[#5f6368] w-6 md:w-8 text-right shrink-0">{line.lineNumber}</span>
                            <pre className="whitespace-pre">{line.content}</pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Panel: State (Responsive Aside) */}
        <aside className={`
          fixed lg:relative inset-y-0 right-0 w-72 md:w-80 border-l border-[#3c4043] bg-[#1e1f20] z-40 p-6 flex flex-col gap-8 overflow-y-auto transition-transform duration-300 lg:translate-x-0
          ${isRightPanelOpen ? 'translate-x-0' : 'translate-x-full'}
        `}>
          <div className="lg:hidden flex justify-between items-center mb-2">
            <h3 className="text-xs font-bold text-[#9aa0a6] uppercase tracking-[1px]">Agent Status</h3>
            <button onClick={() => setIsRightPanelOpen(false)} className="text-[#9aa0a6]">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div>
            <h3 className="text-xs font-bold text-[#9aa0a6] uppercase tracking-[1px] mb-4 hidden lg:block">Agent State</h3>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#131314] p-4 rounded-2xl border border-[#3c4043]">
                <p className="text-[10px] text-[#9aa0a6] font-bold uppercase mb-1">Attempt</p>
                <p className="text-xl md:text-2xl font-google font-bold text-white">{agentState.currentAttempt}</p>
              </div>
              <div className="bg-[#131314] p-4 rounded-2xl border border-[#3c4043]">
                <p className="text-[10px] text-[#9aa0a6] font-bold uppercase mb-1">Confidence</p>
                <p className="text-xl md:text-2xl font-google font-bold text-[#81c995]">{agentState.confidence}%</p>
              </div>
            </div>
            
            <div className="bg-[#131314] p-5 rounded-2xl border border-[#3c4043]">
              <p className="text-[10px] text-[#9aa0a6] font-bold uppercase mb-3">System Health</p>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-[#3c4043] rounded-full overflow-hidden">
                   <div className="h-full bg-[#8ab4f8] transition-all duration-1000" style={{ width: `${agentState.confidence}%` }}></div>
                </div>
                <span className="text-xs font-bold text-[#8ab4f8]">{agentState.confidence}%</span>
              </div>
              <p className="text-[11px] text-[#9aa0a6]">Probability of stability: <span className="text-white">High</span></p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-[#9aa0a6] uppercase tracking-[1px] mb-4">Memory Index</h3>
            <div className="space-y-3">
              {agentState.memory.map((mem, i) => (
                <div key={i} className="bg-[#2d2e30] p-4 rounded-2xl border-l-4 border-[#8ab4f8] text-xs text-[#e3e3e3] leading-relaxed">
                  {mem}
                </div>
              ))}
              {agentState.memory.length === 0 && <p className="text-xs text-[#5f6368] italic">No persistent memories recorded.</p>}
            </div>
          </div>

          <div className="mt-auto">
            <div className="p-4 bg-[#8ab4f8]10 border border-[#8ab4f8]20 rounded-2xl">
              <div className="flex items-center gap-2 mb-2 text-[#8ab4f8]">
                <Icons.Sparkle />
                <span className="text-xs font-bold uppercase">Gemini Context</span>
              </div>
              <p className="text-[11px] text-[#9aa0a6] leading-relaxed">
                Tokens used: 12.4k / 1M. <br/>
                Active reasoning window: 2.4s.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Panel Overlay */}
        {isRightPanelOpen && <div onClick={() => setIsRightPanelOpen(false)} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden" />}

      </main>
    </div>
  );
};

export default Dashboard;
