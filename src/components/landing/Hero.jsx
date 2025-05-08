import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="bg-gradient-to-b from-white to-blue-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center">
          {/* Left column with text */}
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Examino: Smart Attendance & Proctored Exams in One Platform
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Reduce admin work by 70% with AI-driven attendance tracking and cheat-proof online exams.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/login" 
                className="btn btn-primary text-center py-3 px-6 rounded-lg text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
              >
                Get Started for Free
              </Link>
              <a 
                href="#how-it-works" 
                className="btn bg-white text-brand border border-brand text-center py-3 px-6 rounded-lg text-lg hover:bg-blue-50 transition-colors duration-200"
              >
                How It Works
              </a>
            </div>
          </div>
          
          {/* Right column with image */}
          <div className="md:w-1/2 relative">
            <div className="bg-white rounded-xl shadow-xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="bg-gray-800 rounded-t-lg p-2">
                <div className="flex space-x-1">
                  <div className="h-3 w-3 bg-red-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-yellow-500 rounded-full"></div>
                  <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="p-4 bg-gray-100 rounded-b-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-2 animate-pulse"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div key={item} className="h-16 bg-white rounded shadow-sm flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500">
                        {item}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-5/6"></div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-4 -right-4 h-20 w-20 bg-blue-500 rounded-full opacity-20"></div>
            <div className="absolute -top-4 -left-4 h-12 w-12 bg-yellow-500 rounded-full opacity-20"></div>
          </div>
        </div>
        
        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-brand mb-2">98%</div>
            <p className="text-gray-600">Attendance Accuracy</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-brand mb-2">70%</div>
            <p className="text-gray-600">Admin Time Saved</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-brand mb-2">5min</div>
            <p className="text-gray-600">Setup Time</p>
          </div>
        </div>
      </div>
    </section>
  );
}
