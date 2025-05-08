import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Admin Uploads Student Data',
      description: 'Easily import student information via CSV or manual entry. Set up classes and exam schedules in minutes.',
      icon: '📋'
    },
    {
      number: '2',
      title: 'Students Scan Faces via Webcam',
      description: 'Students register their face once, then use it for attendance and exam authentication.',
      icon: '📷'
    },
    {
      number: '3',
      title: 'System Generates Reports',
      description: 'Get detailed analytics on attendance patterns and exam performance with exportable reports.',
      icon: '📊'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How Examino Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our streamlined 3-step process makes implementation quick and easy.
          </p>
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-blue-200 -translate-y-1/2 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div 
                key={index}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200 relative"
              >
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-brand text-white flex items-center justify-center text-xl font-bold">
                  {step.number}
                </div>
                <div className="text-center pt-8">
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="mt-16 text-center">
          <a 
            href="#pricing" 
            className="btn btn-primary py-3 px-8 rounded-lg text-lg shadow-md hover:shadow-lg transition-all duration-200"
          >
            Get Started Today
          </a>
        </div>
      </div>
    </section>
  );
}
