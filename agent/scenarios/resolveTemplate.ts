import alzaTemplate from "./templates/alza-add-to-cart.json";
import { Step } from "./types";

export function resolveTemplate(intent: string): Step[] {
  const normalized = intent.toLowerCase();

  if (
    normalized.includes("alza") ||
    normalized.includes("košík") ||
    normalized.includes("nákup") ||
    normalized.includes("notebook")
  ) {
    return (alzaTemplate as any).steps as Step[];
  }

  throw new Error("No matching template for intent");
}