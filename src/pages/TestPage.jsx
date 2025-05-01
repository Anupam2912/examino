import React from 'react';

export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Tailwind Test Page</h1>

      {/* Regular CSS Classes Test */}
      <div className="test-red">This is a red box using regular CSS</div>
      <div className="test-blue">This is a blue box using regular CSS</div>

      {/* Tailwind Classes Test */}
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

      {/* Regular CSS Test */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        maxWidth: '28rem',
        width: '100%'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: '600',
          color: '#1F2937',
          marginBottom: '16px'
        }}>Inline Styles</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ backgroundColor: '#EF4444', color: 'white', padding: '16px', borderRadius: '4px' }}>
            Red Background (Inline)
          </div>
          <div style={{ backgroundColor: '#3B82F6', color: 'white', padding: '16px', borderRadius: '4px' }}>
            Blue Background (Inline)
          </div>
        </div>
      </div>

      <div className="mt-8">
        <a href="/" className="text-blue-600 hover:text-blue-800 underline">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}
