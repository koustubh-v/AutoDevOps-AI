
import React from 'react';
import { AgentStep } from './types';

// Add explicit AgentStep[] type to ensure status literals match the StepStatus type
export const INITIAL_STEPS: AgentStep[] = [
  { id: 'ingest', label: 'Repository Ingestion', status: 'pending', description: 'Analyzing repository structure and dependencies.' },
  { id: 'test', label: 'Test Execution', status: 'pending', description: 'Running existing test suites to baseline system health.' },
  { id: 'diagnose', label: 'Failure Diagnosis', status: 'pending', description: 'Tracing errors and identifying root causes.' },
  { id: 'fix', label: 'Patch Generation', status: 'pending', description: 'Synthesizing bug fixes based on diagnosed issues.' },
  { id: 'verify', label: 'Verification Loop', status: 'pending', description: 'Re-running tests to confirm fix stability.' },
  { id: 'finalize', label: 'System Stabilization', status: 'pending', description: 'Finalizing the codebase and generating report.' },
];

export const Icons = {
  Terminal: () => <span className="material-symbols-outlined">terminal</span>,
  Cpu: () => <span className="material-symbols-outlined">memory</span>,
  Shield: () => <span className="material-symbols-outlined">verified_user</span>,
  CheckCircle: () => <span className="material-symbols-outlined">check_circle</span>,
  Activity: () => <span className="material-symbols-outlined">analytics</span>,
  GitBranch: () => <span className="material-symbols-outlined">account_tree</span>,
  Settings: () => <span className="material-symbols-outlined">settings</span>,
  Code: () => <span className="material-symbols-outlined">code</span>,
  History: () => <span className="material-symbols-outlined">history</span>,
  Sparkle: () => <span className="material-symbols-outlined" style={{color: 'var(--google-blue)'}}>auto_awesome</span>,
  Security: () => <span className="material-symbols-outlined">security</span>,
  Cloud: () => <span className="material-symbols-outlined">cloud_done</span>,
  Psychology: () => <span className="material-symbols-outlined">psychology</span>,
};

export const MOCK_DIFF = {
  filePath: 'src/services/auth.ts',
  explanation: 'The agent detected an unhandled null return from the database layer. Added a guard clause to prevent the NullPointerException.',
  before: [
    { type: 'neutral', content: '  async login(credentials) {', lineNumber: 39 },
    { type: 'neutral', content: '    const user = await db.users.find(credentials.id);', lineNumber: 40 },
    { type: 'removed', content: '    return { success: true, user: user.profile };', lineNumber: 41 },
    { type: 'neutral', content: '  }', lineNumber: 42 },
  ],
  after: [
    { type: 'neutral', content: '  async login(credentials) {', lineNumber: 39 },
    { type: 'neutral', content: '    const user = await db.users.find(credentials.id);', lineNumber: 40 },
    { type: 'added', content: '    if (!user) throw new AuthError("User not found");', lineNumber: 41 },
    { type: 'added', content: '    return { success: true, user: user.profile };', lineNumber: 42 },
    { type: 'neutral', content: '  }', lineNumber: 43 },
  ]
};
