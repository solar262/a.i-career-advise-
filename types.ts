export enum AnalysisType {
  ROI_FORECAST = 'Forecast Training ROI',
  SKILL_GAPS = 'Identify Future Skill Gaps',
  DEV_PLAN = 'Personalized Development Plan',
}

export interface Employee {
  id: number;
  name: string;
  role: string;
  department: string;
}

export interface Company {
  id: number;
  name: string;
  logoId: string;
  employees: Employee[];
}


// ROI Forecast Types
export interface QuarterlyImpact {
  quarter: string;
  upliftPercentage: number;
}

export interface RoiForecastResult {
  predictedRoiPercentage: number;
  summary: string;
  quarterlyImpact: QuarterlyImpact[];
  keyFactors: string[];
}

// Skill Gaps Types
export interface Skill {
  skill: string;
  importance: number; // 1-10
}

export interface SkillGapsResult {
  analysisSummary: string;
  futureSkills: Skill[];
  decliningSkills: Skill[];
}

// Development Plan Types
export interface DevelopmentStep {
  step: number;
  action: string;
  resources: string;
  timeline: string;
}

export interface DevPlanResult {
  employeeName: string;
  currentRole: string;
  targetRole: string;
  summary: string;
  developmentSteps: DevelopmentStep[];
}

export type PredictionResult = RoiForecastResult | SkillGapsResult | DevPlanResult | null;

// Chat Types
export interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}