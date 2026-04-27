import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, homePathFor } from '../../store/auth';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await login(form.email, form.password);
      const dest = location.state?.from?.pathname || homePathFor(data.role);
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not sign in');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bg">
      <aside className="hidden lg:flex flex-col justify-between p-10 bg-primary-700 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
          aria-hidden
        />
        <div className="relative flex items-center gap-3">
          <Logo size={36} />
          <span className="font-display font-extrabold text-2xl">VPS</span>
        </div>
        <div className="relative max-w-md">
          <h2 className="font-display font-bold text-3xl tracking-h1 text-white mb-3">
            Run your workshop, end to end.
          </h2>
          <p className="text-primary-100 text-md leading-relaxed">
            Inventory, sales, vendor records, customer service — all in one place.
            Built for the way Kathmandu garages actually work.
          </p>
        </div>
        <p className="relative text-xs text-primary-200">
          © 2026 Vehicle Parts System · Kathmandu, Nepal
        </p>
      </aside>

      <main className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Logo size={28} />
            <span className="font-display font-extrabold text-xl">VPS</span>
          </div>
          <h1 className="vps-h1 mb-1.5">Welcome back</h1>
          <p className="vps-body-sm mb-8">
            Sign in to continue. New customer?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">
              Create an account
            </Link>
            .
          </p>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
            <Button type="submit" disabled={submitting} size="lg" className="mt-1">
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-8 p-3 rounded-md border border-border bg-surface-2 text-xs text-fg-2 leading-relaxed">
            <p className="font-semibold text-fg-1 mb-1">Demo access</p>
            Admin · <span className="font-mono">admin@vps.local</span> ·{' '}
            <span className="font-mono">Admin@123</span>
          </div>
        </div>
      </main>
    </div>
  );
}
