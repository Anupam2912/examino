import React from 'react';

export default function Testimonials() {
  const testimonials = [
    {
      quote: "Examino cut our attendance time from 15 mins to 30 seconds! The facial recognition is incredibly accurate.",
      name: "Sarah K.",
      role: "College Administrator",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg"
    },
    {
      quote: "As a professor, I love how the exam proctoring catches cheating attempts automatically. It's made online testing viable again.",
      name: "Michael T.",
      role: "Computer Science Professor",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg"
    },
    {
      quote: "The analytics dashboard gives me insights I never had before. I can see which students are struggling in real-time.",
      name: "Jennifer L.",
      role: "Department Head",
      avatar: "https://randomuser.me/api/portraits/women/68.jpg"
    }
  ];

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Educators Are Saying
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join hundreds of institutions already using Examino to streamline their processes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center mb-4">
                <img 
                  src={testimonial.avatar} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 italic">"{testimonial.quote}"</p>
              <div className="mt-4 flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg 
                    key={star}
                    className="w-5 h-5 text-yellow-400" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Stats */}
        <div className="mt-16 bg-brand rounded-xl p-8 text-white shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <p>Educational Institutions</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50,000+</div>
              <p>Students Registered</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1M+</div>
              <p>Attendance Records</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
