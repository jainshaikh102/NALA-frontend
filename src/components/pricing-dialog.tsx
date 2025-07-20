"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Crown, Rocket } from "lucide-react";

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  icon: React.ReactNode;
  popular?: boolean;
  features: string[];
}

const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 0,
    period: "Free",
    description:
      "Perfect for music enthusiasts getting started with AI assistance",
    icon: <Zap className="h-8 w-8 text-primary" />,
    features: [
      "5 daily chat conversations",
      "Basic music analysis",
      "Standard audio quality",
      "Community support",
      "Basic virality insights",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 10,
    period: "/month",
    description:
      "For serious musicians and content creators who need advanced features",
    icon: <Crown className="h-8 w-8 text-primary" />,
    popular: true,
    features: [
      "Unlimited chat conversations",
      "Advanced music analysis",
      "High-quality audio generation",
      "Video creation tools",
      "Priority support",
      "Advanced virality scoring",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 100,
    period: "/month",
    description:
      "For record labels and music businesses requiring enterprise-grade features",
    icon: <Rocket className="h-8 w-8 text-primary" />,
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "API access",
      "Custom integrations",
      "Dedicated account manager",
      "Advanced analytics dashboard",
    ],
  },
];

interface PricingDialogProps {
  onSelectPlan: (plan: PricingPlan) => void;
  currentPlan?: PricingPlan | null;
}

export default function PricingDialog({
  onSelectPlan,
  currentPlan,
}: PricingDialogProps) {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(
    currentPlan?.id || null
  );

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlan(plan.id);
    onSelectPlan(plan);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl p-8 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            {currentPlan ? "Change Your Plan" : "Choose Your Plan"}
          </h2>
          <p className="text-muted-foreground">
            {currentPlan
              ? "Select a different plan that better suits your needs"
              : "Select the perfect plan for your music journey"}
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? "border-primary shadow-lg shadow-primary/20"
                  : "border-border hover:border-primary/50"
              } ${
                selectedPlan === plan.id
                  ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  : ""
              }`}
              onClick={() => handleSelectPlan(plan)}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              {currentPlan?.id === plan.id && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-green-500 text-white px-3 py-1">
                    Currently Selected
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-4">{plan.icon}</div>
                <CardTitle className="text-xl font-semibold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    {plan.period}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {plan.description}
                </p>
              </CardHeader>

              <CardContent className="pt-0">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full mt-6 ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-card hover:bg-accent text-foreground border border-border"
                  }`}
                  onClick={() => handleSelectPlan(plan)}
                >
                  {plan.price === 0 ? "Get Started Free" : "Choose Plan"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
