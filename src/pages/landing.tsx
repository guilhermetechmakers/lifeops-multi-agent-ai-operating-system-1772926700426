import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AnimatedPage } from "@/components/animated-page";
import {
  Clock,
  Bot,
  Shield,
  Zap,
  Github,
  CreditCard,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Cronjobs as first-class objects",
    description: "Schedule, trigger, and monitor automations with full run artifacts and audit trails.",
    icon: Clock,
  },
  {
    title: "Multi-agent orchestration",
    description: "Agents negotiate, handoff, and execute with traceable messaging and conflict resolution.",
    icon: Bot,
  },
  {
    title: "Human-in-the-loop",
    description: "Suggest-only → approval-required → bounded autopilot. You stay in control.",
    icon: Shield,
  },
  {
    title: "Explainable & reversible",
    description: "Every action is schema-validated, logged, and reversible with full artifacts.",
    icon: Zap,
  },
];

const integrations = [
  { name: "GitHub", icon: Github },
  { name: "Stripe", icon: CreditCard },
  { name: "Plaid", icon: BarChart3 },
];

export default function Landing() {
  return (
    <AnimatedPage className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#111213] to-[#1A1A1B] opacity-90" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-between py-4">
            <span className="text-xl font-semibold text-foreground">LifeOps</span>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="text-foreground">
                  Sign in
                </Button>
              </Link>
              <Link to="/signup">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Create account
                </Button>
              </Link>
            </div>
          </nav>

          <section className="py-20 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              The multi-agent AI operating system
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Automate projects, content, finance, and health with coordinated GPT-powered agents.
              Safe, auditable, and human-in-the-loop by default.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/signup">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Get started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>
          </section>

          <section className="py-16">
            <h2 className="text-center text-2xl font-semibold text-foreground">
              How it works
            </h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map(({ title, description, icon: Icon }, i) => (
                <div
                  key={title}
                  className={cn(
                    "rounded-lg border border-white/[0.03] bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover",
                    "animate-fade-in-up"
                  )}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="rounded-lg bg-primary/10 p-3 w-fit">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="py-16">
            <h2 className="text-center text-2xl font-semibold text-foreground">
              Integrations
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-sm text-muted-foreground">
              Connect GitHub, Stripe, Plaid, QuickBooks, Health APIs and more.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-6">
              {integrations.map(({ name, icon: Icon }) => (
                <div
                  key={name}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.03] bg-card px-4 py-3"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">{name}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="py-20 text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              Ready to automate with control?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              Start with suggest-only agents. Enable approval-required or bounded autopilot when you’re ready.
            </p>
            <Link to="/signup" className="mt-6 inline-block">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Create account
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </AnimatedPage>
  );
}
