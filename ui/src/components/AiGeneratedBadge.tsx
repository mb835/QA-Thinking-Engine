import { FaRobot } from "react-icons/fa";

export default function AiGeneratedBadge() {
  return (
    <div
      title="Tento scénář byl vygenerován pomocí AI"
      className="
        inline-flex items-center gap-1
        px-2 py-1
        text-xs font-semibold
        rounded-full
        bg-gradient-to-r from-indigo-500 to-blue-500
        text-white
        shadow-md
        select-none
      "
    >
      <FaRobot size={12} />
      AI generated
    </div>
  );
}
