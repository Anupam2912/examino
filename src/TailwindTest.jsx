import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Tailwind Test</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tailwind Classes</h2>
        <div className="space-y-4">
          <div className="bg-red-500 text-white p-4 rounded">Red Background</div>
          <div className="bg-blue-500 text-white p-4 rounded">Blue Background</div>
          <div className="bg-green-500 text-white p-4 rounded">Green Background</div>
          <div className="bg-yellow-500 text-white p-4 rounded">Yellow Background</div>
          <div className="bg-purple-500 text-white p-4 rounded">Purple Background</div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
