export type QAInsight = {
  reasoning: string;
  coverage: string[];
  risks: string[];
  automationTips: string[];
};

export type TestCaseType =
  | "ACCEPTANCE"
  | "NEGATIVE"
  | "EDGE"
  | "SECURITY"
  | "UX"
  | "DATA";

export type TestCase = {
  id: string;
  type: TestCaseType;
  title: string;
  description: string;

  preconditions?: string[];
  steps?: string[];
  expectedResult?: string;

  qaInsight?: QAInsight;
};

export type ScenarioResponse = {
  testCase: TestCase;
  additionalTestCases: TestCase[];
};
