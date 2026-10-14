export type StepId = 1 | 2 | 3 | 4 | 5;

export interface StepInfo {
  id: StepId;
  title: string;
  subtitle: string;
  scientificBasis: string;
  evidenceReference: string;
  durationSeconds: number;
  description: string;
  instructions: string[];
}

export interface TrainingSession {
  id: string;
  date: string;
  completedSteps: StepId[];
  gaborScore: number;
  totalTimeSeconds: number;
}
