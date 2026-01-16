export type Step =
  | { action: "goto"; url: string }
  | { action: "fill"; selector: string; value: string }
  | { action: "click"; selector: string }
  | { action: "expect-url"; urlPart: string };

export type TestCase = {
  id: string;
  title: string;
  steps: Step[];
};