"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";
import Link from "next/link";

interface PricingTier {
  name: string;
  description: string;
  price: number;
  period: string;
  popular?: boolean;
  features: Array<{
    name: string;
    included: boolean;
  }>;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    description: "Perfect for small projects and testing",
    price: 0,
    period: "month",
    features: [
      { name: "1 project", included: true },
      { name: "100 feedback items/month", included: true },
      { name: "Basic widget customization", included: true },
      { name: "Email support", included: true },
      { name: "Public feedback board", included: false },
      { name: "Console & network logs", included: false },
      { name: "Custom branding", included: false },
      { name: "Team collaboration", included: false },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Starter",
    description: "For growing teams and products",
    price: 29,
    period: "month",
    features: [
      { name: "5 projects", included: true },
      { name: "1,000 feedback items/month", included: true },
      { name: "Advanced widget customization", included: true },
      { name: "Public feedback board", included: true },
      { name: "Console & network logs", included: true },
      { name: "Email support", included: true },
      { name: "Custom branding", included: false },
      { name: "Team collaboration (5 members)", included: true },
      { name: "Priority support", included: false },
    ],
  },
  {
    name: "Professional",
    description: "For established businesses",
    price: 79,
    period: "month",
    popular: true,
    features: [
      { name: "Unlimited projects", included: true },
      { name: "10,000 feedback items/month", included: true },
      { name: "Full widget customization", included: true },
      { name: "Public feedback board", included: true },
      { name: "Console & network logs", included: true },
      { name: "Custom branding", included: true },
      { name: "Team collaboration (unlimited)", included: true },
      { name: "Priority support", included: true },
      { name: "Slack & Discord integrations", included: true },
    ],
  },
  {
    name: "Enterprise",
    description: "For large organizations",
    price: 199,
    period: "month",
    features: [
      { name: "Everything in Professional", included: true },
      { name: "Unlimited feedback items", included: true },
      { name: "Custom domain", included: true },
      { name: "SSO & SAML", included: true },
      { name: "Advanced security", included: true },
      { name: "SLA guarantee", included: true },
      { name: "Dedicated account manager", included: true },
      { name: "Custom integrations", included: true },
      { name: "On-premise deployment", included: true },
    ],
  },
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Feedback Guru
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/login">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Beta Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700">
              🎉 BETA - 100% FREE
            </Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join our beta and get <span className="font-bold text-indigo-600">all Professional Plan features</span> completely free
          </p>

          {/* Beta Value Proposition */}
          <Card className="max-w-4xl mx-auto mb-12 border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardHeader>
              <CardTitle className="text-2xl">🎯 Beta Value Proposition</CardTitle>
              <CardDescription className="text-base">
                Be part of shaping the future of feedback management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6 text-left">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🎁</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">100% FREE During Beta</h3>
                    <p className="text-gray-600 text-sm">
                      All features unlocked - no credit card required
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🚀</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Professional Plan Features</h3>
                    <p className="text-gray-600 text-sm">
                      Get unlimited access to our most advanced features
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">⚡</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Unlimited Team Members</h3>
                    <p className="text-gray-600 text-sm">
                      Collaborate with your entire team at no extra cost
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🎊</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">50% Lifetime Discount</h3>
                    <p className="text-gray-600 text-sm">
                      Lock in half-price forever when we launch
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <div className="text-3xl">🤝</div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Direct Influence on Roadmap</h3>
                    <p className="text-gray-600 text-sm">
                      Your feedback directly shapes the features we build next
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                    Join Beta Now - It's Free! 🚀
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className={billingPeriod === "monthly" ? "font-semibold" : "text-gray-600"}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === "monthly" ? "annual" : "monthly")}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  billingPeriod === "annual" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className={billingPeriod === "annual" ? "font-semibold" : "text-gray-600"}>
              Annual <Badge variant="secondary">Save 20%</Badge>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-8 px-4">
          {pricingTiers.map((tier) => {
            const isPopular = tier.popular;
            const displayPrice = billingPeriod === "annual" ? Math.floor(tier.price * 0.8) : tier.price;
            const isPaid = tier.price > 0;

            return (
              <Card
                key={tier.name}
                className={`relative ${
                  isPopular
                    ? "border-2 border-indigo-600 shadow-xl scale-105"
                    : "border border-gray-200"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{tier.name}</CardTitle>
                  <CardDescription>{tier.description}</CardDescription>
                  <div className="mt-4">
                    {isPaid ? (
                      <div className="space-y-2">
                        <div className="text-4xl font-bold text-gray-400 line-through">
                          ${displayPrice}
                          <span className="text-lg font-normal">/{tier.period}</span>
                        </div>
                        <div className="text-3xl font-bold text-green-600">
                          FREE
                          <Badge className="ml-2 bg-green-100 text-green-700 hover:bg-green-100">
                            Beta
                          </Badge>
                        </div>
                      </div>
                    ) : (
                      <div className="text-4xl font-bold text-gray-900">
                        ${tier.price}
                        <span className="text-lg font-normal">/{tier.period}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <Link href="/login">
                    <Button
                      className={`w-full mb-6 ${
                        isPopular
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          : ""
                      }`}
                      variant={isPopular ? "default" : "outline"}
                    >
                      {isPaid ? "Get Started Free" : "Get Started"}
                    </Button>
                  </Link>

                  <div className="space-y-3">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={feature.included ? "text-gray-900" : "text-gray-400"}
                        >
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {isPaid && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="text-xs text-center text-indigo-600 font-semibold">
                        🎊 50% OFF when we launch
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto mt-20 px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>How long will the beta last?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  We expect the beta to last 3-6 months. All beta users will be notified at least
                  30 days before we transition to paid plans, and you'll lock in your 50% lifetime
                  discount automatically.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What happens to my data after beta?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  All your data is yours forever. When beta ends, you can choose to continue with
                  50% off any paid plan, downgrade to the free plan, or export all your data.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Do I need a credit card to join the beta?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  No! The beta is completely free with no credit card required. You'll only need to
                  provide payment information if you choose to continue after the beta period ends.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Can I switch plans later?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Absolutely! You can upgrade or downgrade at any time. Beta users will always keep
                  their 50% lifetime discount when upgrading to any paid plan.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Final CTA */}
        <div className="max-w-4xl mx-auto mt-20 px-4">
          <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Join hundreds of teams already using Feedback Guru to collect, manage, and act on
                user feedback. Start free today!
              </p>
              <Link href="/login">
                <Button
                  size="lg"
                  className="text-lg px-8 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                >
                  Start Your Free Beta Access 🚀
                </Button>
              </Link>
              <p className="text-sm text-gray-500 mt-4">
                No credit card required • Full access to Professional features • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <Link href="/pricing">Pricing</Link>
                </li>
                <li>
                  <Link href="/dashboard">Dashboard</Link>
                </li>
                <li>Features</li>
                <li>Roadmap</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-600">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Widget Guide</li>
                <li>Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
                <li>Security</li>
                <li>GDPR</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2025 Feedback Guru. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
