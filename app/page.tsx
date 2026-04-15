import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import {
  MessageSquare,
  Upload,
  BarChart3,
  ArrowRight,
  Check,
  ScanLine,
  NotebookPen,
  MessagesSquare,
} from "lucide-react";

export default function LandingPage() {
  const features = [
    {
      icon: Upload,
      title: "Knowledge base that teams can actually maintain",
      description:
        "Upload PDFs, service documents, pricing sheets, FAQs, and plain text so your bot answers from real company context.",
    },
    {
      icon: MessageSquare,
      title: "Website widget for lead capture and support",
      description:
        "Add a branded chat widget to any site and handle common sales and support conversations without waiting on your team.",
    },
    {
      icon: ScanLine,
      title: "WhatsApp onboarding with business-first setup",
      description:
        "Guide clients through account connection, compliance, and message flows so WhatsApp feels like an extension of their company.",
    },
    {
      icon: NotebookPen,
      title: "Control over tone, replies, and escalation",
      description:
        "Define what the assistant should say, when it should hand off, and how it should represent the company in every channel.",
    },
    {
      icon: BarChart3,
      title: "Conversation visibility for every company",
      description:
        "Review chats, monitor missed intents, and keep improving knowledge quality as the product gets real customer traffic.",
    },
    {
      icon: MessagesSquare,
      title: "Built for agencies and multi-client operations",
      description:
        "Create a repeatable system for onboarding multiple businesses instead of rebuilding the same support stack each time.",
    },
  ];

  const steps = [
    "Client uploads company information, service details, and offer documents.",
    "You tune the assistant voice, fallback rules, and escalation logic.",
    "The client goes live on web chat first, then WhatsApp through the approved business flow.",
  ];

  const plans = [
    {
      name: "Starter",
      price: "₹0",
      description: "For demos, testing, and early client onboarding.",
      cta: "Start Free",
      href: "/auth/sign-up",
      featured: false,
      items: ["50 chats per month", "1 AI agent", "Website widget", "Basic analytics"],
    },
    {
      name: "Growth",
      price: "₹399",
      description: "For businesses ready to run support across web and WhatsApp.",
      cta: "Try Growth",
      href: "/auth/sign-up?plan=pro",
      featured: true,
      items: ["10,000 chats per month", "3 AI agents", "WhatsApp workflow", "Priority support"],
    },
    {
      name: "Scale",
      price: "₹999",
      description: "For agencies and larger teams managing multiple conversations daily.",
      cta: "Talk to Sales",
      href: "/auth/sign-up?plan=pro_plus",
      featured: false,
      items: ["Unlimited chats", "Unlimited AI agents", "Custom training", "API access"],
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5efe6] text-[#1f1a17]">
      <div className="fixed inset-0 pointer-events-none paper-grid opacity-40" />
      <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_top,_rgba(202,123,69,0.22),_transparent_56%)]" />

      <header className="relative z-10">
        <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <BrandLogo />
          <div className="flex items-center gap-3">
            <Link href="#pricing">
              <Button variant="ghost" className="text-[#5f564e] hover:bg-[#eadfce] hover:text-[#1f1a17]">
                Pricing
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="ghost" className="text-[#5f564e] hover:bg-[#eadfce] hover:text-[#1f1a17]">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button className="rounded-full bg-[#1f1a17] px-6 text-[#f7f1e8] hover:bg-[#3b312b]">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid w-full max-w-7xl gap-14 px-6 pb-20 pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:pb-28 lg:pt-16">
          <div>
            <div className="mb-6 inline-flex items-center rounded-full border border-[#1f1a17]/10 bg-[#fffaf3] px-4 py-2 text-sm text-[#6e6257]">
              Website + WhatsApp support for service businesses
            </div>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.94] tracking-tight md:text-7xl">
              Build an AI support system that feels like part of the company.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[#5f564e]">
              Train one assistant on company documents, product details, and support policies, then use it across website chat and WhatsApp with a setup clients can understand.
            </p>
            <div className="mt-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link href="/auth/sign-up">
                <Button size="lg" className="rounded-full bg-[#a54d2d] px-8 text-base text-[#fff7ef] hover:bg-[#8f4023]">
                  Start building
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="#workflow">
                <Button size="lg" variant="outline" className="rounded-full border-[#1f1a17]/15 bg-[#fffaf3] px-8 text-base text-[#1f1a17] hover:bg-[#efe3d3]">
                  See workflow
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {[
                ["24/7", "reply coverage"],
                ["PDF + text", "knowledge ingestion"],
                ["Multi-client", "company onboarding"],
              ].map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-[#1f1a17]/10 bg-[#fffaf3] p-5">
                  <p className="font-display text-3xl">{value}</p>
                  <p className="mt-2 text-sm uppercase tracking-[0.18em] text-[#7a6d61]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="warm-shadow rounded-[2rem] border border-[#1f1a17]/10 bg-[#fffaf3] p-6 sm:p-8">
            <div className="flex items-center justify-between border-b border-[#1f1a17]/10 pb-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[#8a7665]">Launch board</p>
                <p className="mt-2 font-display text-3xl">From company docs to live replies</p>
              </div>
              <div className="rounded-full bg-[#e9d6bf] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#7b4b2c]">
                Live
              </div>
            </div>
            <div className="mt-6 space-y-4">
              {[
                ["Knowledge Base", "Brochure.pdf, pricing.txt, service FAQs"],
                ["Website Widget", "Lead qualification, support answers, handoff rules"],
                ["WhatsApp", "Onboard verified business account and automate safe replies"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-3xl bg-[#f6ecdf] p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-[#8a7665]">{title}</p>
                  <p className="mt-2 text-base leading-7 text-[#413831]">{copy}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-3xl border border-dashed border-[#a54d2d]/35 bg-[#fff7ef] p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-[#8a7665]">Why this feels credible</p>
              <p className="mt-2 text-base leading-7 text-[#413831]">
                Less “AI magic”, more operational clarity: what the bot knows, where it replies, and how companies stay in control.
              </p>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-y border-[#1f1a17]/10 bg-[#f0e2cf]">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-10">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-[#8a7665]">Workflow</p>
              <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
                A practical product story beats a generic AI homepage every time.
              </h2>
            </div>
            <div className="grid gap-4">
              {steps.map((step, index) => (
                <div key={step} className="flex gap-4 rounded-3xl border border-[#1f1a17]/10 bg-[#fffaf3] p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1f1a17] text-sm font-semibold text-[#f7f1e8]">
                    0{index + 1}
                  </div>
                  <p className="pt-1 text-base leading-7 text-[#413831]">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.28em] text-[#8a7665]">Core product</p>
            <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
              Designed around how real companies share information, not how template generators stack sections.
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-[1.75rem] border border-[#1f1a17]/10 bg-[#fffaf3] p-6 transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f0e2cf] text-[#a54d2d]">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-display text-2xl leading-tight">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-[#5f564e]">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="pricing" className="border-t border-[#1f1a17]/10 bg-[#1f1a17] text-[#f3ebde]">
          <div className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.28em] text-[#cbb8a7]">Pricing</p>
              <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
                Start small, then move clients into the workflow that matches their volume.
              </h2>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-[1.75rem] border p-7 ${
                    plan.featured
                      ? "border-[#cf7a4b] bg-[#2c241f]"
                      : "border-white/10 bg-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.2em] text-[#d9c9bb]">{plan.name}</p>
                      <p className="mt-3 font-display text-5xl">{plan.price}</p>
                      <p className="mt-3 text-sm text-[#cbb8a7]">{plan.description}</p>
                    </div>
                    {plan.featured ? (
                      <span className="rounded-full bg-[#cf7a4b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#1f1a17]">
                        Popular
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-8 space-y-3">
                    {plan.items.map((item) => (
                      <div key={item} className="flex items-center gap-3 text-sm text-[#f3ebde]">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  <Link href={plan.href} className="mt-8 block">
                    <Button
                      className={`w-full rounded-full py-6 ${
                        plan.featured
                          ? "bg-[#cf7a4b] text-[#1f1a17] hover:bg-[#da8a5d]"
                          : "bg-[#f3ebde] text-[#1f1a17] hover:bg-[#fff7ef]"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-10">
          <div className="rounded-[2rem] border border-[#1f1a17]/10 bg-[#fffaf3] p-8 sm:p-10 lg:flex lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.28em] text-[#8a7665]">Ready to refine the brand</p>
              <h2 className="mt-4 font-display text-4xl leading-tight md:text-5xl">
                Launch the product with a look that feels operational, trustworthy, and human-made.
              </h2>
            </div>
            <Link href="/auth/sign-up" className="mt-8 block lg:mt-0">
              <Button size="lg" className="rounded-full bg-[#1f1a17] px-8 text-[#f7f1e8] hover:bg-[#3b312b]">
                Create your workspace
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-[#1f1a17]/10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-[#6e6257] lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <Link href="/auth/sign-up">
            <span className="font-display text-xl font-semibold text-[#1f1a17]">AgentHub</span>
          </Link>
          <p>Human-looking design for a real AI operations product.</p>
        </div>
      </footer>
    </div>
  );
}
