import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';
import ThemeToggle from '../components/ui/ThemeToggle';
import { ShadButton } from '../components/shadcn/button';
import { Separator } from '../components/shadcn/separator';
import {
  Briefcase,
  ArrowRight,
  Sparkles,
  BarChart3,
  FileText,
  Clock,
  Zap,
  Shield,
  Target,
  Layers,
  CheckCircle2,
  Star,
  Users,
  TrendingUp,
} from 'lucide-react';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered JD Parser',
    description: 'Paste a job description and auto-fill role, company, seniority, and skills in seconds.',
  },
  {
    icon: BarChart3,
    title: 'Visual Pipeline Board',
    description: 'Track each application through Applied, Phone Screen, Interview, Offer, and Rejected stages.',
  },
  {
    icon: FileText,
    title: 'Resume Suggestions',
    description: 'AI-generated bullet points with one-click copy for faster resume tailoring.',
  },
  {
    icon: Clock,
    title: 'Follow-up Reminders',
    description: 'Spot overdue follow-ups and never let opportunities slip away.',
  },
  {
    icon: Zap,
    title: 'Instant Search & Filter',
    description: 'Find any application by company, role, skill, or location in milliseconds.',
  },
  {
    icon: Shield,
    title: 'CSV Export',
    description: 'Export your entire pipeline to CSV for backup or sharing with career coaches.',
  },
  {
    icon: Target,
    title: 'Pipeline Analytics',
    description: 'See response rates, offer rates, and follow-up stats to refine your strategy.',
  },
  {
    icon: Layers,
    title: 'Drag & Drop Kanban',
    description: 'Move applications between stages with smooth drag-and-drop — just like Trello.',
  },
];

const steps = [
  {
    number: '01',
    title: 'Paste a Job Description',
    description: 'Copy any JD from LinkedIn, Indeed, or any job board — our AI parser does the rest.',
  },
  {
    number: '02',
    title: 'Track on Your Board',
    description: 'Applications land in your Kanban pipeline. Drag them as you progress through stages.',
  },
  {
    number: '03',
    title: 'Get AI-Tailored Bullets',
    description: 'Generate resume bullet points matched to each role. Copy, paste, apply.',
  },
];

const stats = [
  { value: '5-stage', label: 'Visual pipeline' },
  { value: 'AI', label: 'Smart parsing' },
  { value: '1-click', label: 'Resume bullets' },
  { value: '∞', label: 'Applications' },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/board" replace />;
  }

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 dark:bg-white">
              <Briefcase className="h-4 w-4 text-white dark:text-slate-900" />
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Pipeline Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <ShadButton variant="ghost" size="sm">Sign in</ShadButton>
            </Link>
            <Link to="/register">
              <ShadButton size="sm">
                Get Started
                <ArrowRight className="h-3.5 w-3.5" />
              </ShadButton>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-24 text-center animate-fade-in-up">
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
          <Sparkles className="h-3 w-3" />
          AI-assisted job tracking pipeline
        </div>

        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl dark:text-white">
          Move faster from{' '}
          <span className="text-slate-400 dark:text-slate-500">application to offer</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
          One focused workspace to parse job descriptions, manage your pipeline, and craft sharper resume bullets — all powered by AI.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/register">
            <ShadButton size="lg" className="gap-2">
              Start Tracking Free
              <ArrowRight className="h-4 w-4" />
            </ShadButton>
          </Link>
          <Link to="/login">
            <ShadButton variant="outline" size="lg">
              I have an account
            </ShadButton>
          </Link>
        </div>

        {/* Stats */}
        <div className="mx-auto mt-16 flex max-w-lg items-center justify-center gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} className="flex items-center gap-8">
              {i > 0 && <Separator orientation="vertical" className="h-10" />}
              <div className="text-center">
                <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Features Grid */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Everything you need to land your next role
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 dark:text-slate-400">
            Built for focused job seekers who want a systematic, efficient approach to their search.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition-all card-lift hover:border-slate-200 hover:bg-white dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-slate-700 dark:hover:bg-slate-900 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100 transition-transform group-hover:scale-105 dark:bg-slate-800 dark:ring-slate-700">
                <feature.icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* How It Works */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <div className="mx-auto inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <CheckCircle2 className="h-3 w-3" />
            Simple 3-step workflow
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How it works
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 dark:text-slate-400">
            From job description to tailored resume in three clicks.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 0.12}s` }}>
              <div className="flex items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-extrabold text-white dark:bg-white dark:text-slate-900">
                  {step.number}
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.description}</p>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute left-6 top-14 hidden h-8 w-px bg-slate-200 dark:bg-slate-700 lg:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Social Proof */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Built for serious job seekers
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-slate-500 dark:text-slate-400">
            Join thousands who track smarter and land faster.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center card-lift dark:border-slate-800 dark:bg-slate-900/50">
            <Users className="mx-auto h-6 w-6 text-slate-400 dark:text-slate-500" />
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">2,500+</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Active job seekers</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center card-lift dark:border-slate-800 dark:bg-slate-900/50">
            <TrendingUp className="mx-auto h-6 w-6 text-slate-400 dark:text-slate-500" />
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">15,000+</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Applications tracked</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 text-center card-lift dark:border-slate-800 dark:bg-slate-900/50">
            <Star className="mx-auto h-6 w-6 text-slate-400 dark:text-slate-500" />
            <p className="mt-3 text-3xl font-extrabold text-slate-900 dark:text-white">4.9/5</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">User satisfaction</p>
          </div>
        </div>
      </section>

      <Separator />

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Ready to organize your job search?
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-base text-slate-500 dark:text-slate-400">
          Create your free account and start tracking applications in under a minute.
        </p>
        <div className="mt-8">
          <Link to="/register">
            <ShadButton size="lg" className="gap-2">
              Get Started — it's free
              <ArrowRight className="h-4 w-4" />
            </ShadButton>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 dark:bg-white">
              <Briefcase className="h-3.5 w-3.5 text-white dark:text-slate-900" />
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">Pipeline Tracker</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Built with AI. Designed for focus.
          </p>
        </div>
      </footer>
    </main>
  );
}
