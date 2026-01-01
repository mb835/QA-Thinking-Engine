type Props = {
  testCase: any;
};

export default function RunTestButton({ testCase }: Props) {
  const generatePlaywright = async () => {
    await fetch("/api/run-playwright", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ testCase }),
    });
  };

  return (
    <button
      onClick={generatePlaywright}
      className="px-3 py-1 text-sm rounded-md bg-indigo-600 hover:bg-indigo-500"
    >
      ▶ Generate Playwright
    </button>
  );
}
