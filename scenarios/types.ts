export type QAInsight = {
  reasoning: string;
  coverage: string[];
  risks: string[];
  automationTips?: string[];
};

export type TestCase = {
  id: string;
  title: string;
  type: "ACCEPTANCE" | "NEGATIVE" | "EDGE";
  steps: string[];
  expectedResult: string;
  qaInsight: QAInsight;
};
