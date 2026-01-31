
import React from 'react';
import { AgentState, AgentStep } from '../types';
import { Icons } from '../constants';

interface ReportPageProps {
  agentState: AgentState;
  steps: AgentStep[];
  onReset: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ agentState, steps, onReset }) => {
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
              <p className="text-sm font-mono font-medium">AD-712-BETA-STABLE</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-2">Build Date</p>
              <p className="text-sm font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#5f6368] uppercase tracking-widest mb-2">Duration</p>
              <p className="text-sm font-medium">14m 22s</p>
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
        <div className="flex-1 p-8 md:p-16">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-google font-bold mb-2 tracking-tight">Post-Mortem Analysis</h1>
              <p className="text-lg md:text-xl text-[#5f6368] font-light">Codebase stability restored via autonomous reconciliation.</p>
            </div>
            <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-sm font-bold flex items-center gap-2">
              Verified by Gemini-3
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 mb-12 md:mb-16">
            {[
              { label: 'Reconciliation Cycles', val: agentState.currentAttempt, trend: 'Optimal' },
              { label: 'Structural Fixes', val: '1', trend: 'Verified' },
              { label: 'Unit Tests Passed', val: '42 / 42', trend: '100%' },
              { label: 'Agent Confidence', val: `${agentState.confidence}%`, trend: 'Target Met' },
            ].map(stat => (
              <div key={stat.label} className="bg-white p-4 rounded-2xl border border-[#dadce0] shadow-sm">
                <p className="text-[10px] font-bold text-[#5f6368] uppercase mb-1">{stat.label}</p>
                <p className="text-2xl md:text-3xl font-google font-bold">{stat.val}</p>
                <p className="text-[9px] text-emerald-600 font-bold mt-1">Status: {stat.trend}</p>
              </div>
            ))}
          </div>

          <div className="space-y-12">
            {/* Executive Summary */}
            <div>
              <h3 className="text-lg font-bold border-b border-[#dadce0] pb-3 mb-6 flex items-center gap-2 text-[#1a73e8]">
                <Icons.Sparkle /> Executive Reasoning Summary
              </h3>
              <div className="text-base md:text-lg leading-relaxed text-[#3c4043] bg-white p-6 md:p-8 rounded-[24px] md:rounded-[32px] border border-[#dadce0] shadow-sm italic relative">
                <div className="absolute top-4 right-4 text-[#e8eaed] opacity-50">
                   <span className="material-symbols-outlined text-4xl">format_quote</span>
                </div>
                "The autonomous agent initialized a recursive trace of the CI pipeline failure. Analysis isolated a regression in the user authentication module (src/services/auth.ts) where an unhandled null database cursor led to a fatal exception. The agent synthesized a multi-layer guard clause, refactored the database interface for null-safety, and validated the fix against the primary integration suite. No regressions were detected in neighboring modules."
              </div>
            </div>

            {/* Detailed Decision Log */}
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
                        <p className="text-xs">Zero circular dependencies found after patch.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Security Signature Match</p>
                        <p className="text-xs">No insecure coding patterns (eval, unsanitized SQL) detected.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Regression Test Coverage</p>
                        <p className="text-xs">100% path coverage for the modified auth module.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-[24px] border border-[#dadce0] shadow-sm">
                  <h4 className="font-bold mb-4 text-[#1a73e8] text-sm uppercase tracking-wider flex items-center gap-2">
                    <Icons.Activity /> Resource Impact
                  </h4>
                  <div className="space-y-4 text-sm text-[#5f6368]">
                    <div className="flex gap-3">
                      <span className="text-indigo-500 font-bold">→</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Memory Footprint</p>
                        <p className="text-xs">Stayed within target (42MB heap overhead).</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-indigo-500 font-bold">↓</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Avg Response Latency</p>
                        <p className="text-xs">Reduced by 4.2% through logic pruning.</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <span className="text-indigo-500 font-bold">↑</span>
                      <div>
                        <p className="font-bold text-[#3c4043]">Build Throughput</p>
                        <p className="text-xs">Verified 2.1x faster cycle recovery.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-16 md:mt-24 flex flex-col sm:flex-row justify-between items-center pt-8 border-t border-[#dadce0] gap-6">
            <div className="flex flex-col items-center sm:items-start">
              <p className="text-[10px] font-mono text-[#9aa0a6] uppercase tracking-widest">Digital Certificate Fingerprint</p>
              <p className="text-[9px] font-mono text-[#bdc1c6] max-w-[200px] md:max-w-none truncate">0xAD_F5E2_712_BETA_AUTONOMOUS_RUN_91024_STABLE</p>
            </div>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-[#202124] text-white rounded-full font-bold hover:bg-black transition-all shadow-md">
                Export Audit Log
              </button>
              <button className="px-8 py-3 bg-white text-[#202124] border border-[#dadce0] rounded-full font-bold hover:bg-[#f8f9fa] transition-all shadow-sm">
                Commit Patch
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
