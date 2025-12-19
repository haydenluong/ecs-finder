import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-8">ECS Finder</h1>
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
        <button 
          onClick={() => setCount((count) => count + 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
        >
          Count is {count}
        </button>
        <p className="mt-4 text-gray-400">
          Tailwind CSS is working! Start building your app.
        </p>
      </div>
    </div>
  )
}

export default App
