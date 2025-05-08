import React from 'react';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for small classes and individual educators.',
      features: [
        '50 student accounts',
        'Basic attendance tracking',
        'Simple exam creation',
        'Email support'
      ],
      cta: 'Get Started',
      ctaColor: 'bg-gray-800 hover:bg-gray-700',
      popular: false
    },
    {
      name: 'Pro',
      price: '$20',
      period: 'per month',
      description: 'Ideal for departments and small institutions.',
      features: [
        'Unlimited students',
        'Advanced proctoring features',
        'Detailed analytics dashboard',
        'Export reports to CSV/PDF',
        'Priority support'
      ],
      cta: 'Try Pro Free',
      ctaColor: 'bg-brand hover:bg-blue-600',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'pricing',
      description: 'For large institutions with specific requirements.',
      features: [
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees',
        'On-premise deployment option',
        'Custom branding'
      ],
      cta: 'Contact Sales',
      ctaColor: 'bg-gray-800 hover:bg-gray-700',
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that fits your needs. All plans include core features.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-1 ${
                plan.popular ? 'ring-2 ring-brand relative' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-brand text-white px-4 py-1 text-sm font-medium">
                  Most Popular
                </div>
              )}
              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="ml-1 text-gray-500">/{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center">
                      <svg className="h-5 w-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to="/login" 
                  className={`w-full ${plan.ctaColor} text-white py-3 px-4 rounded-lg text-center block font-medium transition-colors duration-200`}
                >
                  {plan.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* FAQ */}
        <div className="mt-20">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-2">Can I upgrade or downgrade my plan?</h4>
              <p className="text-gray-600">Yes, you can change your plan at any time. Changes take effect at the start of the next billing cycle.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-2">Is there a contract or commitment?</h4>
              <p className="text-gray-600">No, all plans are month-to-month with no long-term contracts required.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and institutional purchase orders.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h4 className="font-semibold text-lg mb-2">Is my data secure?</h4>
              <p className="text-gray-600">Yes, we use end-to-end encryption and comply with FERPA and other educational data standards.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
