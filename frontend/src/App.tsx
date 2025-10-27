import { useState, useEffect } from 'react'

interface Robot {
  id: number
  name: string
  type: string
  status: string
}

function App() {
  const [robots, setRobots] = useState<Robot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRobots()
  }, [])

  const fetchRobots = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/robots')
      const data = await response.json()
      setRobots(data.robots)
      setError(null)
    } catch (err) {
      setError('Failed to fetch robots. Make sure the backend is running.')
      console.error('Error fetching robots:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            🤖 Robot Demo
          </h1>
          <p className="text-xl text-gray-600">
            React + Vite + Tailwind CSS + FastAPI
          </p>
        </header>

        <main className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Robot Fleet
              </h2>
              <button
                onClick={fetchRobots}
                className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Refresh
              </button>
            </div>

            {loading && (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="mt-4 text-gray-600">Loading robots...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {!loading && !error && robots.length === 0 && (
              <p className="text-center text-gray-500 py-8">No robots found.</p>
            )}

            {!loading && !error && robots.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {robots.map((robot) => (
                  <div
                    key={robot.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {robot.name}
                    </h3>
                    <p className="text-gray-600 mb-1">
                      <span className="font-medium">Type:</span> {robot.type}
                    </p>
                    <p className="text-gray-600">
                      <span className="font-medium">Status:</span>{' '}
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          robot.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {robot.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Tech Stack
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-center">
                <span className="text-blue-500 mr-2">⚛️</span>
                <span>React 18 with TypeScript</span>
              </li>
              <li className="flex items-center">
                <span className="text-purple-500 mr-2">⚡</span>
                <span>Vite for blazing fast builds</span>
              </li>
              <li className="flex items-center">
                <span className="text-cyan-500 mr-2">🎨</span>
                <span>Tailwind CSS for styling</span>
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">🚀</span>
                <span>FastAPI backend</span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
