export interface SessionIntro {
  headline: string;
  highlights: string[];
  body: string;
  cta_text: string;
}

export interface ProblemSummary {
  scenario: string;
  scenario_points?: string[];
  data: string[];
  business_rules: string[];
  performance_constraints: string[];
}

export interface ThinkingStep {
  step_title: string;
  ideal: string;
  your_approach: string;
}

export interface QuestionData {
  question_id: string;
  question_number: number;
  topic: string;
  score: number;
  score_text: string;
  question_prompt: string;
  problem_summary: ProblemSummary;
  feedback_points?: string[];
  feedback_summary: string;
  what_went_right: string[];
  what_went_wrong: string[];
  thinking_advice: string;
  thinking_steps: ThinkingStep[];
}

export interface SessionData {
  session_id: string;
  candidate_name: string;
  case_title: string;
  intro: SessionIntro;
  questions: QuestionData[];
}
