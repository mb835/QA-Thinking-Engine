import { FaRobot, FaRedo, FaExclamationTriangle } from "react-icons/fa";

type AiStatus = "ok" | "retried" | "partial" | null;

type Props = {
  status?: AiStatus;
};

export default function AiGeneratedBadge({ status }: Props) {
  // default = ok
  if (status === "retried") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
        <FaRedo />
        AI generated (retried)
      </span>
    );
  }

  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400">
        <FaExclamationTriangle />
        AI generated (partial)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-600/20 text-emerald-400">
      <FaRobot />
      AI generated
    </span>
  );
}
