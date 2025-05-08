import React from 'react';

export default function Features() {
  const features = [
    {
      icon: '👁️',
      title: 'AI Attendance',
      description: 'Mark attendance automatically via webcam with 98% accuracy.',
      bgColor: 'bg-blue-50',
      iconBgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      icon: '⏱️',
      title: 'Exam Proctoring',
      description: 'Timed exams with anti-cheat measures like tab switching detection.',
      bgColor: 'bg-green-50',
      iconBgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      icon: '📊',
      title: 'Analytics Dashboard',
      description: 'Real-time insights on attendance rates and exam performance.',
      bgColor: 'bg-purple-50',
      iconBgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      icon: '🔒',
      title: 'Secure Platform',
      description: 'End-to-end encryption and compliance with educational data standards.',
      bgColor: 'bg-yellow-50',
      iconBgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200'
    },
    {
      icon: '📱',
      title: 'Mobile Friendly',
      description: 'Works on any device with a camera and internet connection.',
      bgColor: 'bg-red-50',
      iconBgColor: 'bg-red-100',
      borderColor: 'border-red-200'
    },
    {
      icon: '🔄',
      title: 'Real-time Updates',
      description: 'Instant syncing of attendance and exam data across devices.',
      bgColor: 'bg-indigo-50',
      iconBgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-200'
    }
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Modern Education
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Examino combines cutting-edge AI with intuitive design to streamline attendance and exams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.bgColor} border ${feature.borderColor} rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200`}
            >
              <div className={`${feature.iconBgColor} w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
