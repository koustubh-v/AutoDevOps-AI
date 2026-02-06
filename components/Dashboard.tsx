
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
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
  const [activeTab, setActiveTab] = useState<'logs' | 'diff'>('logs');
  
  // Mobile responsive states
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);

  const getRepoInitial = () => {
    if (!agentState.repoUrl) return 'G';
    const parts = agentState.repoUrl.split('/');
    const lastPart = parts.pop();
    if (!lastPart) return 'G';
    return lastPart.charAt(0).toUpperCase() || 'G';
  };

  const currentStep = steps.find(s => s.status === 'running') || steps.find(s => s.status === 'failed') || steps[steps.length - 1];

  return (
    <div className="h-screen flex flex-col bg-[#131314] overflow-hidden font-google text-[#e3e3e3]">
      
      {/* Mobile Backdrop Overlay */}
      {(isLeftOpen || isRightOpen) && (
        <div 
          className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => { setIsLeftOpen(false); setIsRightOpen(false); }}
        />
      )}

      {/* Material 3 Top App Bar */}
      <header className="shrink-0 h-16 bg-[#1e1f20] px-4 md:px-6 flex items-center justify-between shadow-sm z-20 relative">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsLeftOpen(!isLeftOpen)}
            className="lg:hidden p-2 -ml-2 text-[#e3e3e3] hover:bg-[#2d2e30] rounded-full transition-colors"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          
          <div className="bg-[#8ab4f8]/10 p-2 rounded-xl text-[#8ab4f8] hidden sm:block">
             <Icons.Cpu />
          </div>
          <h1 className="text-lg font-medium text-[#e3e3e3] truncate max-w-[150px] sm:max-w-none">AutoDevOps AI</h1>
          <span className="hidden sm:inline-block h-4 w-[1px] bg-[#444746] mx-2"></span>
          <span className="hidden sm:inline-block text-sm text-[#9aa0a6]">Session {agentState.simulationId || 'AD-712'}</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
           {isRunning ? (
             <div className="flex items-center gap-2 bg-[#131314] border border-[#3c4043] px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#8ab4f8] animate-pulse"></div>
                <span className="hidden sm:inline text-xs font-medium text-[#8ab4f8]">Processing</span>
             </div>
           ) : (
             <div className="flex items-center gap-2 bg-[#131314] border border-[#3c4043] px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#81c995]"></div>
                <span className="hidden sm:inline text-xs font-medium text-[#81c995]">Ready</span>
             </div>
           )}
           
           {/* Mobile Stats Button */}
           <button 
             onClick={() => setIsRightOpen(!isRightOpen)}
             className="lg:hidden p-2 text-[#e3e3e3] hover:bg-[#2d2e30] rounded-full transition-colors"
           >
             <span className="material-symbols-outlined">info</span>
           </button>

           <div className="hidden lg:flex w-8 h-8 rounded-full bg-[#8ab4f8] text-[#1e1f20] items-center justify-center font-bold text-sm shadow-md">
             {getRepoInitial()}
           </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left Nav: Agent State / Timeline Stepper */}
        {/* Drawer for Mobile, Sidebar for Desktop */}
        <aside 
          className={`
            fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-[#1e1f20] flex flex-col border-r border-[#131314] 
            transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
            ${isLeftOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          <div className="p-6 pb-2 flex justify-between items-center">
            <h2 className="text-xs font-medium text-[#8ab4f8] uppercase tracking-wider">Agent State</h2>
            <button 
              onClick={() => setIsLeftOpen(false)} 
              className="lg:hidden text-[#9aa0a6] hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-1">
            {steps.map((step, index) => (
              <div 
                key={step.id} 
                className={`relative pl-4 py-3 rounded-xl transition-all ${step.status === 'running' ? 'bg-[#2d2e30]' : ''}`}
              >
                {/* Connector Line */}
                {index !== steps.length - 1 && (
                  <div className="absolute left-[27px] top-10 bottom-[-10px] w-[2px] bg-[#3c4043]"></div>
                )}
                
                <div className="flex gap-4 relative z-10">
                  <div className={`mt-0.5 rounded-full flex items-center justify-center bg-[#1e1f20]`}>
                    {step.status === 'success' ? (
                      <span className="material-symbols-outlined text-[#81c995] text-xl">check_circle</span>
                    ) : step.status === 'running' ? (
                      <span className="material-symbols-outlined text-[#8ab4f8] text-xl animate-spin">progress_activity</span>
                    ) : step.status === 'failed' ? (
                      <span className="material-symbols-outlined text-[#f28b82] text-xl">error</span>
                    ) : (
                      <span className="material-symbols-outlined text-[#444746] text-xl">radio_button_unchecked</span>
                    )}
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${step.status === 'pending' ? 'text-[#757779]' : 'text-[#e3e3e3]'}`}>
                      {step.label}
                    </p>
                    {step.status === 'running' && (
                       <p className="text-xs text-[#8ab4f8] mt-0.5">In Progress...</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Content */}
        <section className="flex-1 flex flex-col bg-[#131314] relative w-full lg:w-auto">
          
          {/* Tabs */}
          <div className="px-6 pt-4 flex gap-4 border-b border-[#2d2e30]">
            <button 
              onClick={() => setActiveTab('logs')}
              className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === 'logs' ? 'text-[#8ab4f8]' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
            >
              Activity Log
              {activeTab === 'logs' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8ab4f8] rounded-t-full"></span>}
            </button>
            <button 
              onClick={() => setActiveTab('diff')}
              className={`pb-3 px-2 text-sm font-medium transition-all relative ${activeTab === 'diff' ? 'text-[#8ab4f8]' : 'text-[#9aa0a6] hover:text-[#e3e3e3]'}`}
            >
              Code Changes
              {activeTab === 'diff' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-[#8ab4f8] rounded-t-full"></span>}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth">
            {activeTab === 'logs' && (
              <div className="max-w-4xl mx-auto space-y-3">
                {logs.map(log => (
                  <div key={log.id} className="bg-[#1e1f20] rounded-2xl p-4 flex gap-4 border border-[#2d2e30] shadow-sm hover:border-[#3c4043] transition-colors">
                    <div className="shrink-0 mt-1">
                       {log.type === 'error' ? <span className="material-symbols-outlined text-[#f28b82]">warning</span> :
                        log.type === 'audit' ? <span className="material-symbols-outlined text-[#81c995]">verified</span> :
                        log.type === 'reasoning' ? <span className="material-symbols-outlined text-[#8ab4f8]">psychology</span> :
                        <span className="material-symbols-outlined text-[#5f6368]">info</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-xs font-bold uppercase tracking-wider ${log.type === 'error' ? 'text-[#f28b82]' : log.type === 'audit' ? 'text-[#81c995]' : log.type === 'reasoning' ? 'text-[#8ab4f8]' : 'text-[#9aa0a6]'}`}>
                          {log.type}
                        </span>
                        <span className="text-xs text-[#5f6368] whitespace-nowrap ml-2">{log.timestamp}</span>
                      </div>
                      <div className={`text-sm leading-relaxed break-words ${log.type === 'reasoning' ? 'text-[#d3e3fd]' : 'text-[#c4c7c5]'}`}>
                        {log.type === 'reasoning' ? (
                          <ReactMarkdown 
                            components={{
                              h1: ({children}) => <h1 className="text-lg font-bold text-[#e3e3e3] mt-3 mb-2">{children}</h1>,
                              h2: ({children}) => <h2 className="text-base font-bold text-[#e3e3e3] mt-3 mb-2">{children}</h2>,
                              h3: ({children}) => <h3 className="text-sm font-bold text-[#e3e3e3] mt-2 mb-1">{children}</h3>,
                              ul: ({children}) => <ul className="list-disc pl-5 my-2 space-y-1">{children}</ul>,
                              ol: ({children}) => <ol className="list-decimal pl-5 my-2 space-y-1">{children}</ol>,
                              code: ({node, inline, className, children, ...props}: any) => {
                                return !inline ? (
                                  <div className="bg-[#131314] p-3 rounded-lg border border-[#3c4043] my-2 overflow-x-auto font-mono text-xs shadow-inner">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </div>
                                ) : (
                                  <code className="bg-[#131314] px-1.5 py-0.5 rounded text-xs font-mono border border-[#3c4043]" {...props}>
                                    {children}
                                  </code>
                                )
                              }
                            }}
                          >
                            {log.message}
                          </ReactMarkdown>
                        ) : (
                          log.message
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isRunning && (
                   <div className="flex justify-center py-8 opacity-70">
                      <div className="flex items-center gap-3 bg-[#1e1f20] px-6 py-3 rounded-full border border-[#2d2e30]">
                         <div className="w-2 h-2 bg-[#8ab4f8] rounded-full animate-bounce"></div>
                         <div className="w-2 h-2 bg-[#8ab4f8] rounded-full animate-bounce delay-100"></div>
                         <div className="w-2 h-2 bg-[#8ab4f8] rounded-full animate-bounce delay-200"></div>
                         <span className="text-sm text-[#9aa0a6] ml-2">Reasoning Engine Active</span>
                      </div>
                   </div>
                )}
              </div>
            )}

            {activeTab === 'diff' && (
              <div className="h-full">
                {agentState.generatedDiff ? (
                  <div className="bg-[#1e1f20] rounded-[24px] border border-[#2d2e30] overflow-hidden flex flex-col h-full shadow-lg">
                    <div className="px-6 py-4 bg-[#2d2e30] flex justify-between items-center border-b border-[#131314]">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="material-symbols-outlined text-[#9aa0a6] shrink-0">description</span>
                        <span className="text-sm font-medium text-[#e3e3e3] truncate">{agentState.generatedDiff.filePath}</span>
                      </div>
                      <div className="bg-[#188038]/20 text-[#81c995] px-3 py-1 rounded-full text-xs font-medium shrink-0 ml-2">
                        Verified Patch
                      </div>
                    </div>
                    
                    <div className="flex-1 overflow-auto p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#0b0c0d]">
                       {/* Left: Original */}
                       <div className="bg-[#131314] rounded-xl border border-[#2d2e30] p-4 overflow-x-auto">
                          <p className="text-xs font-medium text-[#5f6368] mb-4 uppercase">Before</p>
                          <div className="font-mono text-xs leading-6">
                            {agentState.generatedDiff.before.map((l, i) => (
                              <div key={i} className={`flex ${l.type === 'removed' ? 'bg-[#5c2b29]/30' : ''}`}>
                                <span className="w-8 text-[#444746] select-none text-right mr-4 shrink-0">{l.lineNumber}</span>
                                <span className={`${l.type === 'removed' ? 'text-[#f28b82]' : 'text-[#c4c7c5]'} whitespace-pre`}>{l.content}</span>
                              </div>
                            ))}
                          </div>
                       </div>
                       
                       {/* Right: New */}
                       <div className="bg-[#131314] rounded-xl border border-[#2d2e30] p-4 overflow-x-auto">
                          <p className="text-xs font-medium text-[#5f6368] mb-4 uppercase">After</p>
                          <div className="font-mono text-xs leading-6">
                            {agentState.generatedDiff.after.map((l, i) => (
                              <div key={i} className={`flex ${l.type === 'added' ? 'bg-[#0f5223]/30' : ''}`}>
                                <span className="w-8 text-[#444746] select-none text-right mr-4 shrink-0">{l.lineNumber}</span>
                                <span className={`${l.type === 'added' ? 'text-[#81c995]' : 'text-[#c4c7c5]'} whitespace-pre`}>{l.content}</span>
                              </div>
                            ))}
                          </div>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className="bg-[#1e1f20] p-6 rounded-full mb-6">
                       <span className="material-symbols-outlined text-4xl text-[#5f6368]">code_off</span>
                    </div>
                    <p className="text-lg font-medium text-[#e3e3e3]">No code changes yet</p>
                    <p className="text-sm text-[#9aa0a6] max-w-xs text-center mt-2">
                      The agent is currently analyzing the codebase. Diffs will appear here once a patch is synthesized.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar: Material Widgets */}
        {/* Drawer for Mobile, Sidebar for Desktop */}
        <aside 
          className={`
            fixed lg:relative inset-y-0 right-0 z-40 w-80 bg-[#1e1f20] p-6 border-l border-[#131314] overflow-y-auto space-y-6
            transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl lg:shadow-none
            ${isRightOpen ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          <div className="flex justify-between items-center lg:hidden mb-4">
             <h3 className="text-sm font-medium text-[#e3e3e3]">Session Stats</h3>
             <button onClick={() => setIsRightOpen(false)} className="text-[#9aa0a6] hover:text-white">
               <span className="material-symbols-outlined">close</span>
             </button>
          </div>
          
          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-3">
             <div className="bg-[#2d2e30] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-medium text-[#e3e3e3] mb-1">{agentState.currentAttempt}</span>
                <span className="text-xs text-[#9aa0a6]">Attempt</span>
             </div>
             <div className="bg-[#2d2e30] p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[#81c995]/5"></div>
                <span className="text-2xl font-medium text-[#81c995] mb-1">
                  {Number(agentState.confidence).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                </span>
                <span className="text-xs text-[#9aa0a6]">Confidence</span>
             </div>
          </div>

          {/* Health Widget */}
          <div className="bg-[#2d2e30] p-5 rounded-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="material-symbols-outlined text-[#8ab4f8]">monitor_heart</span>
              <span className="text-sm font-medium text-[#e3e3e3]">System Health</span>
            </div>
            <div className="w-full h-2 bg-[#131314] rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#8ab4f8] transition-all duration-1000" style={{ width: `${agentState.confidence}%` }}></div>
            </div>
            <div className="flex justify-between text-xs text-[#9aa0a6]">
               <span>Unstable</span>
               <span>Stable</span>
            </div>
          </div>

          {/* Context Memory */}
          <div>
             <h3 className="text-xs font-medium text-[#9aa0a6] uppercase tracking-wider mb-4 ml-1">Context Memory</h3>
             <div className="space-y-3">
               {agentState.memory.slice(-4).map((mem, i) => (
                 <div key={i} className="bg-[#131314] p-4 rounded-2xl text-xs text-[#c4c7c5] leading-relaxed border border-[#3c4043]">
                   {mem}
                 </div>
               ))}
               {!agentState.memory.length && (
                  <div className="text-center py-6 opacity-50">
                    <span className="text-xs text-[#5f6368]">No active context</span>
                  </div>
               )}
             </div>
          </div>

        </aside>

      </div>
    </div>
  );
};

export default Dashboard;
