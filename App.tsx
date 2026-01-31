
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppView, AgentStep, LogEntry, AgentState, StepStatus } from './types';
import { INITIAL_STEPS, Icons } from './constants';
import LandingPage from './components/LandingPage';
import SetupPage from './components/SetupPage';
import Dashboard from './components/Dashboard';
import ReportPage from './components/ReportPage';
import { getAgentReasoning } from './services/gemini';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('landing');
  const [steps, setSteps] = useState<AgentStep[]>(INITIAL_STEPS);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [agentState, setAgentState] = useState<AgentState>({
    currentAttempt: 1,
    maxAttempts: 5,
    confidence: 0,
    riskLevel: 'Low',
    memory: [],
    repoUrl: '',
    branch: 'main',
  });

  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substr(2, 9),
        type,
        message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]);
  }, []);

  const updateStep = useCallback((id: string, status: StepStatus, description?: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id ? { ...step, status, timestamp: status === 'running' || status === 'success' ? new Date().toLocaleTimeString() : step.timestamp, description: description || step.description } : step
      )
    );
  }, []);

  // Simulation Logic
  const startAutonomousRun = async () => {
    setView('dashboard');
    addLog('system', 'AutoDevOps AI initialized. Loading Gemini 3 reasoning context...');
    
    // 1. Ingest
    updateStep('ingest', 'running');
    const reasoning1 = await getAgentReasoning("Starting repository ingestion for " + agentState.repoUrl);
    addLog('reasoning', reasoning1);
    await new Promise(r => setTimeout(r, 2000));
    updateStep('ingest', 'success');
    setAgentState(prev => ({ ...prev, confidence: 25, memory: ['Detected Monolith structure with legacy Auth services'] }));

    // 2. Test
    updateStep('test', 'running');
    addLog('system', 'Executing global test suite via npm run test:all');
    await new Promise(r => setTimeout(r, 2000));
    addLog('test', 'CRITICAL_FAILURE: src/services/auth.test.ts [line 41]');
    addLog('error', 'Uncaught TypeError: Cannot read property "profile" of null');
    updateStep('test', 'failed');
    setAgentState(prev => ({ ...prev, confidence: 15, riskLevel: 'Medium' }));

    // 3. Diagnose
    updateStep('diagnose', 'running');
    const reasoning2 = await getAgentReasoning("Failure isolated to auth.ts line 41. The user object is undefined when database returns empty set. Root cause: Missing null guard.");
    addLog('reasoning', reasoning2);
    await new Promise(r => setTimeout(r, 3000));
    updateStep('diagnose', 'success');
    setAgentState(prev => ({ ...prev, confidence: 45, memory: [...prev.memory, 'Database query returns null on edge case'] }));

    // 4. Fix
    updateStep('fix', 'running');
    addLog('system', 'Generating code patch via Gemini 3 Flash...');
    await new Promise(r => setTimeout(r, 3000));
    addLog('system', 'Synthesized patch. Strategy: Implement error boundaries and null safety checks.');
    updateStep('fix', 'success');
    setAgentState(prev => ({ ...prev, confidence: 75 }));

    // 5. Verify
    updateStep('verify', 'running');
    addLog('system', 'Applying git patch. Re-running integration tests...');
    await new Promise(r => setTimeout(r, 3000));
    addLog('test', 'ALL PASS: 42 tests executed successfully (1.8s)');
    updateStep('verify', 'success');
    setAgentState(prev => ({ ...prev, confidence: 98, riskLevel: 'Low' }));

    // 6. Finalize
    updateStep('finalize', 'running');
    addLog('system', 'Stability verified. Cleaning up build artifacts.');
    await new Promise(r => setTimeout(r, 2000));
    updateStep('finalize', 'success');
    
    addLog('system', 'Autonomous run complete. Generating summary report.');
    await new Promise(r => setTimeout(r, 1000));
    setView('report');
  };

  return (
    <div className="min-h-screen bg-[#131314] text-[#e3e3e3] font-sans selection:bg-[#8ab4f8]30">
      {view === 'landing' && (
        <LandingPage onStart={() => setView('setup')} />
      )}
      
      {view === 'setup' && (
        <SetupPage 
          onLaunch={(config) => {
            setAgentState(prev => ({ ...prev, ...config }));
            startAutonomousRun();
          }} 
          onBack={() => setView('landing')}
        />
      )}

      {view === 'dashboard' && (
        <Dashboard 
          steps={steps} 
          logs={logs} 
          agentState={agentState} 
        />
      )}

      {view === 'report' && (
        <ReportPage 
          agentState={agentState} 
          steps={steps}
          onReset={() => {
            setSteps(INITIAL_STEPS);
            setLogs([]);
            setView('landing');
          }}
        />
      )}
    </div>
  );
};

export default App;
