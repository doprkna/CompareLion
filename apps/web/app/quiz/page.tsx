export default function QuizPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Quiz</h1>
        <p className="text-gray-600 mb-6">This is a placeholder for the quiz page.</p>
        <div className="space-y-4">
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Create Poll</h2>
            <p className="text-sm text-gray-500">[TODO: Create poll modal/section]</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Review Poll</h2>
            <p className="text-sm text-gray-500">[TODO: Review poll modal/section]</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Questions</h2>
            <p className="text-sm text-gray-500">[TODO: Questions section]</p>
          </div>
          <div className="border rounded p-4">
            <h2 className="font-semibold mb-2">Skip / Select Other</h2>
            <p className="text-sm text-gray-500">[TODO: Skip/select other action]</p>
          </div>
        </div>
      </div>
    </div>
  );
}
