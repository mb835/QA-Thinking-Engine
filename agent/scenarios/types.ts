export type QAInsight = {
  reasoning: string;
  coverage: string[];
  risks: string[];
  automationTips: string[];
};

export type TestCase = {
  id: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: string[];
  expectedResult: string;
  qaInsight: QAInsight;
  additionalTestCases: TestCase[];
  type?: "NEGATIVE" | "EDGE" | "SECURITY" | "UX" | "DATA";
};
