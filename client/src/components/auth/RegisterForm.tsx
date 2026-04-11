import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../api/authApi';
import { ShadButton } from '../shadcn/button';
import { ShadInput } from '../shadcn/input';
import { Separator } from '../shadcn/separator';
import { Mail, Lock, ArrowRight, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      const data = await registerUser(email, password);
      login(data.token, data.user);
      toast.success('Account created successfully!');
      navigate('/board');
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="hidden w-1/2 flex-col items-center justify-center bg-slate-50 px-16 lg:flex dark:bg-slate-900">
        <div className="w-full max-w-md animate-slide-in-left">
          <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-800 dark:ring-slate-700">
            <Rocket className="h-7 w-7 text-slate-700 dark:text-slate-300" />
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Your Pipeline,
          </h1>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-400 dark:text-slate-500">
            Starts Here.
          </h1>

          <p className="mt-6 text-[15px] leading-relaxed text-slate-500 dark:text-slate-400">
            Centralize job tracking, move cards across your pipeline, and generate role-specific resume bullets instantly. Built for focused job seekers.
          </p>

          <div className="mt-12 flex gap-12">
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">100%</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Free to use</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">AI</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Resume bullets</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col items-center justify-center bg-white px-6 lg:w-1/2 dark:bg-slate-950">
        <div className="w-full max-w-sm animate-fade-in-up">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Start tracking applications in one place.
          </p>

          <div className="mt-8 space-y-4">
            <ShadButton variant="outline" className="w-full h-11 gap-3 font-medium" type="button">
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </ShadButton>

            <div className="relative flex items-center">
              <Separator className="flex-1" />
              <span className="px-4 text-xs font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500">
                or continue with email
              </span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <ShadInput
                label="Work Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                icon={<Mail className="h-4 w-4" />}
                required
              />
              <ShadInput
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                icon={<Lock className="h-4 w-4" />}
                required
                minLength={8}
              />
              <ShadInput
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                icon={<Lock className="h-4 w-4" />}
                required
                minLength={8}
              />
              <ShadButton type="submit" className="w-full h-11" isLoading={isLoading}>
                Create Account
                <ArrowRight className="h-4 w-4" />
              </ShadButton>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-slate-900 hover:underline dark:text-white">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
            By signing up, you agree to our{' '}
            <span className="underline cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
}
