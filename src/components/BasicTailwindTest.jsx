rimport React from 'react';

export default function BasicTailwindTest() {
  return (
    <div className="mt-8 mx-auto max-w-md">
      <div className="bg-blue-500 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">Basic Tailwind Test</h2>
        <p className="mt-2">This is a simple component with Tailwind classes.</p>
      </div>
      
      <div className="mt-4 bg-red-500 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">Red Box</h2>
        <p className="mt-2">This should be a red box with white text.</p>
      </div>
      
      <div className="mt-4 bg-green-500 text-white p-4 rounded-lg shadow-md">
        <h2 className="text-xl font-bold">Green Box</h2>
        <p className="mt-2">This should be a green box with white text.</p>
      </div>
    </div>
  );
}
