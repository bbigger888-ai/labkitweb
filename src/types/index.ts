// Interview Platform Types

export type Role = 'developer' | 'tester' | 'analyst';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface InterviewSession {
  id: string;
  candidate: Candidate;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  results: InterviewResult[];
}

export interface InterviewResult {
  taskId: string;
  score: number;
  maxScore: number;
  notes: string;
  completedAt: Date;
}

// Developer-specific types
export interface CodingTask {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: ProgrammingLanguage;
  starterCode: string;
  testCases: TestCase[];
  timeLimit: number; // minutes
}

export type ProgrammingLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'csharp';

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface CodeSubmission {
  taskId: string;
  code: string;
  language: ProgrammingLanguage;
  submittedAt: Date;
  results: TestResult[];
}

export interface TestResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: string;
  error?: string;
  executionTime?: number;
}

// Tester-specific types
export interface TestScenario {
  id: string;
  title: string;
  description: string;
  applicationUrl: string;
  expectedBugs: Bug[];
  timeLimit: number;
}

export interface Bug {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  isHidden: boolean;
}

export interface BugReport {
  id: string;
  title: string;
  severity: 'critical' | 'major' | 'minor' | 'trivial';
  stepsToReproduce: string;
  expectedResult: string;
  actualResult: string;
  screenshot?: string;
  reportedAt: Date;
}

export interface TestCaseDoc {
  id: string;
  title: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: 'high' | 'medium' | 'low';
}

// Analyst-specific types
export interface AnalysisTask {
  id: string;
  title: string;
  description: string;
  type: 'requirements' | 'data_analysis' | 'process_modeling' | 'use_case';
  materials: TaskMaterial[];
  timeLimit: number;
}

export interface TaskMaterial {
  id: string;
  title: string;
  type: 'document' | 'spreadsheet' | 'diagram' | 'interview_transcript';
  content: string;
}

export interface RequirementsDocument {
  id: string;
  title: string;
  functionalRequirements: Requirement[];
  nonFunctionalRequirements: Requirement[];
  constraints: string[];
  assumptions: string[];
}

export interface Requirement {
  id: string;
  description: string;
  priority: 'must' | 'should' | 'could' | 'wont';
  category: string;
}

export interface UseCase {
  id: string;
  title: string;
  actor: string;
  preconditions: string[];
  mainFlow: string[];
  alternativeFlows: AlternativeFlow[];
  postconditions: string[];
}

export interface AlternativeFlow {
  condition: string;
  steps: string[];
}

export interface DiagramData {
  type: 'flowchart' | 'sequence' | 'erd' | 'bpmn';
  nodes: DiagramNode[];
  edges: DiagramEdge[];
}

export interface DiagramNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
}

export interface DiagramEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

// Interview state
export interface InterviewState {
  currentRole: Role | null;
  candidateName: string;
  isInterviewStarted: boolean;
  currentTaskIndex: number;
  timeRemaining: number;
  completedTasks: string[];
}
