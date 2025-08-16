import { useState } from "react";
import { Icon } from "@iconify/react";
import { LargeCard } from "../../components/dashboardCard";
import Button from "../../components/button";

const plans = [
  {
    id: "basic",
    name: "BASIC PLAN",
    price: "₦5,000",
    period: "/ Week",
    features: [
      "Feature as one of the Top 4 Restaurants of the Week",
      "Exclusive Now Now Marketing Campaigns",
      "Guaranteed Sales Boost of at Least 30%"
    ],
    buttonText: "Choose Plan",
    isPopular: false
  },
  {
    id: "premium",
    name: "PREMIUM PLAN",
    price: "₦15,000",
    period: "/ Month",
    features: [
      "Feature as one of the Top 4 Restaurants of the Week",
      "Exclusive Now Now Marketing Campaigns",
      "One(1) Custom Graphic Design",
      "Guaranteed Sales Boost of at Least 30%"
    ],
    buttonText: "Choose Plan",
    isPopular: true
  }
];

export default function Branding() {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (planId) => {
    setSelectedPlan(planId);
    // Add your plan selection logic here
    console.log(`Selected plan: ${planId}`);
  };

  return (
    <div className="bg-[#fdf6f1] min-h-screen p-8">
      <h1 className="text-3xl font-semibold mb-8 text-gray-900">Brand Promotion</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Promotional Banner */}
        <div className="lg:col-span-1">
          <div className="bg-orange-100 rounded-2xl p-8 h-full flex flex-col justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute right-0 top-0 w-32 h-32 opacity-30">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <path d="M20,50 Q50,20 80,50 Q50,80 20,50" fill="#fb923c" fillOpacity="0.3"/>
                <path d="M30,60 Q60,30 90,60 Q60,90 30,60" fill="#fb923c" fillOpacity="0.2"/>
              </svg>
            </div>
            
            {/* Shopping bag icon */}
            <div className="mb-6">
              <div className="w-16 h-16 bg-orange-200 rounded-2xl flex items-center justify-center">
                <Icon icon="majesticons:shopping-bag" className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Promote your brand on Now Now for a token!
            </h2>
            
            <p className="text-gray-600 text-lg">
              Reach more audience, make more sales
            </p>
          </div>
        </div>

        {/* Pricing Plans */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-8 border-2 transition-all duration-200 relative ${
                  selectedPlan === plan.id 
                    ? 'border-orange-500 shadow-lg' 
                    : 'border-gray-100 hover:border-gray-200'
                }`}
              >
                {/* Popular Badge */}
                {plan.isPopular && (
                  <div className="absolute -top-3 right-6">
                    <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Popular
                    </div>
                  </div>
                )}

                {/* Plan Header */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-500 tracking-wide mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Icon icon="majesticons:check" className="w-3 h-3 text-orange-600" />
                      </div>
                      <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Choose Plan Button */}
                <Button
                  variant="primary"
                  fullWidth
                  className="py-3 font-medium"
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="mt-12">
        <LargeCard title="Why Choose Now Now Branding?" icon="majesticons:star-line">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="majesticons:users" className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Wider Reach</h4>
              <p className="text-gray-600 text-sm">Get featured to thousands of potential customers on our platform</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="majesticons:trending-up" className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Guaranteed Results</h4>
              <p className="text-gray-600 text-sm">Minimum 30% sales boost or your money back guarantee</p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Icon icon="majesticons:palette" className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Professional Design</h4>
              <p className="text-gray-600 text-sm">Custom graphics and marketing materials designed by experts</p>
            </div>
          </div>
        </LargeCard>
      </div>
    </div>
  );
}