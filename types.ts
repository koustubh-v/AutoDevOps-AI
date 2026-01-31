
export type AppView = 'landing' | 'setup' | 'dashboard' | 'report';

export type StepStatus = 'pending' | 'running' | 'success' | 'failed';

export interface AgentStep {
  id: string;
  label: string;
  status: StepStatus;
  timestamp?: string;
  description?: string;
}

export interface LogEntry {
  id: string;
  type: 'system' | 'test' | 'reasoning' | 'error';
  message: string;
  timestamp: string;
}

export interface AgentState {
  currentAttempt: number;
  maxAttempts: number;
  confidence: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  memory: string[];
  repoUrl: string;
  branch: string;
}

export interface DiffLine {
  type: 'added' | 'removed' | 'neutral';
  content: string;
  lineNumber: number;
}

export interface CodeFix {
  filePath: string;
  explanation: string;
  before: DiffLine[];
  after: DiffLine[];
}
