"use client";
import { motion } from "framer-motion";
import { Check, Sparkles, Star, Zap } from "lucide-react";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      description: "Perfect for beginners starting their yoga journey",
      price: 0,
      period: "month",
      popular: false,
      features: [
        "5 yoga sessions per month",
        "Basic pose correction",
        "3 beginner routines",
        "Progress tracking (30 days)",
        "Community access",
        "Email support",
      ],
      cta: "Start Free",
      gradient: "from-gray-400 to-gray-600",
      icon: <Star className="w-5 h-5" />,
    },
    {
      name: "Pro",
      description: "For dedicated practitioners seeking deeper transformation",
      price: 19,
      period: "month",
      popular: true,
      features: [
        "Unlimited yoga sessions",
        "Advanced pose correction AI",
        "Personalized routines",
        "Detailed progress analytics",
        "Meditation & breathing exercises",
        "Priority support",
        "Weekly personalized challenges",
        "Export progress reports",
      ],
      cta: "Start 14-Day Trial",
      gradient: "from-purple-500 to-blue-600",
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      name: "Premium",
      description: "Complete wellness transformation with 1:1 guidance",
      price: 49,
      period: "month",
      popular: false,
      features: [
        "Everything in Pro",
        "1:1 virtual yoga sessions (2/month)",
        "Customized wellness plans",
        "Advanced biomechanics analysis",
        "Nutrition guidance",
        "Family plan (up to 4 users)",
        "24/7 priority support",
        "Early access to new features",
      ],
      cta: "Get Premium",
      gradient: "from-amber-500 to-orange-600",
      icon: <Zap className="w-5 h-5" />,
    },
  ];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-600">
              Transformation
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Start your journey today. No credit card required for free plan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-sm font-semibold px-4 py-1 rounded-full shadow-lg">
                    Most Popular
                  </span>
                </div>
              )}

              <div
                className={`h-full bg-white rounded-2xl shadow-xl border ${
                  plan.popular ? "border-2 border-purple-200" : "border-gray-200"
                } overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col`}
              >
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${plan.gradient} text-white`}>
                          {plan.icon}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-gray-800">${plan.price}</span>
                      <span className="text-gray-500 ml-2">/{plan.period}</span>
                    </div>
                    {plan.price > 0 && (
                      <p className="text-gray-500 text-sm mt-2">Billed monthly</p>
                    )}
                    {plan.price === 0 && (
                      <p className="text-green-500 text-sm mt-2 font-medium">No credit card required</p>
                    )}
                  </div>

                  <div className="flex-grow mb-6">
                    <div className="h-6 flex items-center mb-3">
                      <span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                        Includes:
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto pt-4">
                    <button
                      className={`w-full py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
                        plan.popular
                          ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white hover:from-purple-600 hover:to-blue-700"
                          : "border-2 border-gray-300 text-gray-800 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50"
                      }`}
                    >
                      {plan.cta}
                    </button>
                    
                    {plan.price === 0 && (
                      <p className="text-center text-gray-500 text-sm mt-3">
                        No time limit on free plan
                      </p>
                    )}
                  </div>
                </div>

                {plan.popular && (
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-blue-600"></div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;