import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Bot,
  MessageSquare,
  Upload,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Check,
  Sparkles,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Gradient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <header className="relative z-10 border-b border-border/50 backdrop-blur-xl bg-background/80">
        <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              AgentHub
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="#pricing">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Pricing
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/25">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">
              AI-Powered Customer Support
            </span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent">
              Build Your AI Agent
            </span>
            <br />
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              In Minutes
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Create intelligent AI agents trained on your business data. Deploy on your website 
            and WhatsApp to provide 24/7 customer support that actually understands your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 py-6 text-lg shadow-2xl shadow-primary/30">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="px-8 py-6 text-lg border-border/50 bg-transparent hover:bg-secondary">
                See How It Works
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            50 free chats included. No credit card required.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Everything You Need to Deploy AI Support
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              From knowledge base to deployment, we handle the complexity so you can focus on your business.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Upload,
                title: "Upload Your Knowledge",
                description:
                  "Upload PDFs, documents, or paste text. Our AI learns your business instantly.",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                icon: MessageSquare,
                title: "Website Chat Widget",
                description:
                  "Embed a beautiful chat widget on your site with just one line of code.",
                gradient: "from-accent/20 to-accent/5",
              },
              {
                icon: Bot,
                title: "WhatsApp Integration",
                description:
                  "Connect WhatsApp Business to reach customers on their favorite platform.",
                gradient: "from-primary/20 to-accent/5",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                description:
                  "Track conversations, measure satisfaction, and optimize your AI agent.",
                gradient: "from-accent/20 to-primary/5",
              },
              {
                icon: Zap,
                title: "Instant Responses",
                description:
                  "Sub-second response times powered by cutting-edge AI infrastructure.",
                gradient: "from-primary/20 to-primary/5",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description:
                  "Your data is encrypted and isolated. SOC 2 compliant infrastructure.",
                gradient: "from-accent/20 to-accent/5",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 hover:border-primary/30 transition-all duration-300"
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Simple, Transparent Pricing
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Start free and scale as you grow. No hidden fees, no surprises.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-border transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Free</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">₹0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Perfect for trying out AgentHub and small projects.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "50 chats per month",
                  "1 AI agent",
                  "Website widget",
                  "Basic analytics",
                  
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <Check className="w-3 h-3 text-muted-foreground" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up" className="block">
                <Button variant="outline" className="w-full py-6 bg-transparent hover:bg-secondary border-border">
                  Get Started Free
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-card to-accent/10 border-2 border-primary/50 hover:border-primary transition-all duration-300 scale-105">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-medium">
                Most Popular
              </div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-primary mb-2">Pro</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">₹399</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                For growing businesses that need more conversations.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "10,000 chats per month",
                  "3 AI agents",
                  "WhatsApp integration",
                  "Advanced analytics",
                  "Priority support",
                  "Custom branding",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up?plan=pro" className="block">
                <Button className="w-full py-6 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-lg shadow-primary/25">
                  Start Pro Trial
                </Button>
              </Link>
            </div>

            {/* Pro+ Plan */}
            <div className="relative p-8 rounded-2xl bg-card border border-border/50 hover:border-accent/50 transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-accent mb-2">Pro+</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">₹999</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Unlimited scale for enterprises and high-volume teams.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited chats",
                  "Unlimited AI agents",
                  "All integrations",
                  "Custom AI training",
                  "Dedicated support",
                  "SLA guarantee",
                  "API access",
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-foreground">
                    <div className="w-5 h-5 rounded-full bg-accent/20 flex items-center justify-center">
                      <Check className="w-3 h-3 text-accent" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link href="/auth/sign-up?plan=pro_plus" className="block">
                <Button variant="outline" className="w-full py-6 bg-transparent hover:bg-accent/10 border-accent/50 hover:border-accent">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 border-t border-border/50">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-balance">
              Ready to Transform Your Customer Support?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of businesses using AgentHub to provide instant, 
              intelligent support to their customers.
            </p>
            <Link href="/auth/sign-up">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-10 py-6 text-lg shadow-2xl shadow-primary/30">
                Start Building for Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Bot className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">AgentHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              2026 AgentHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
