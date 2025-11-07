"use client";

interface ResultCardProps {
  result: {
    id: string;
    score: number;
    resultText: string;
    userA: any;
    userB: any;
    test: any;
    createdAt: string;
    shared?: boolean;
  };
  onShare?: () => void;
}

export function SynchResultCard({ result, onShare }: ResultCardProps) {
  const score = result.score || 0;
  const resultText = result.resultText || '';

  return (
    <div className="rounded border p-6 bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="text-center mb-6">
        <div className="text-4xl font-bold mb-2">{Math.round(score)}%</div>
        <div className="text-xl text-gray-700 mb-4">{resultText}</div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">User A</div>
          <div className="font-semibold">{result.userA?.username || result.userA?.name || 'Unknown'}</div>
        </div>
        <div className="text-2xl">⚡</div>
        <div className="text-center">
          <div className="text-sm text-gray-600 mb-1">User B</div>
          <div className="font-semibold">{result.userB?.username || result.userB?.name || 'Unknown'}</div>
        </div>
      </div>

      {result.test && (
        <div className="text-center text-sm text-gray-500 mb-4">
          {result.test.title}
        </div>
      )}

      {onShare && (
        <div className="text-center">
          <button
            onClick={onShare}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Share Result
          </button>
        </div>
      )}
    </div>
  );
}

