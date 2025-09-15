export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PareL MVP</h1>
          <p className="mt-2 text-gray-600">Task Routing Platform - Coming Soon!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Task Management</h3>
            <p className="text-gray-600">Create, view, and manage tasks with status tracking</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Routing</h3>
            <p className="text-gray-600">Automatically route tasks to automation or human VAs</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Workflow Engine</h3>
            <p className="text-gray-600">Configurable workflows with keyword triggers and actions</p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Setup Status</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              <span>Next.js app running</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">⚠️</span>
              <span>Database setup needed (PostgreSQL + Redis)</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-500 mr-2">⚠️</span>
              <span>Authentication setup needed</span>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Install Docker Desktop</li>
              <li>Run <code className="bg-gray-100 px-1 rounded">docker compose up -d</code></li>
              <li>Run <code className="bg-gray-100 px-1 rounded">pnpm run db:push</code></li>
              <li>Run <code className="bg-gray-100 px-1 rounded">pnpm run db:seed</code></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}



