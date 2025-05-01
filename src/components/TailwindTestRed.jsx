import React from 'react';

export default function TailwindTestRed() {
  return (
    <div className="p-6 max-w-sm mx-auto bg-red-500 rounded-xl shadow-md flex items-center space-x-4 mt-8">
      <div className="flex-shrink-0">
        <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center text-red-500 font-bold">
          T
        </div>
      </div>
      <div>
        <div className="text-xl font-medium text-white">Tailwind Test (RED)</div>
        <p className="text-white">This should be a RED box if Tailwind is working!</p>
      </div>
    </div>
  );
}
