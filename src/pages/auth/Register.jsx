import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth, homePathFor } from '../../store/auth';
import Button from '../../components/ui/Button';
import { Input, Textarea } from '../../components/ui/Input';
import Logo from '../../components/ui/Logo';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '+977 ',
    password: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = await register({
        ...form,
        phoneNumber: form.phoneNumber.replace(/\s+/g, ''),
      });
      navigate(homePathFor(data.role), { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not create account');
    } finally {
      setSubmitting(false);
    }
  };

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md bg-surface border border-border rounded-lg p-8">
        <div className="flex items-center gap-2 mb-6">
          <Logo size={28} />
          <span className="font-display font-extrabold text-xl">VPS</span>
        </div>
        <h1 className="vps-h1 mb-1.5">Create your account</h1>
        <p className="vps-body-sm mb-7">
          Self-register as a customer. Already have an account?{' '}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            Sign in
          </Link>
          .
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <Input
            label="Full name"
            required
            value={form.fullName}
            onChange={update('fullName')}
            placeholder="Hari Sharma"
          />
          <Input
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={update('email')}
            placeholder="hari@example.com"
          />
          <Input
            label="Phone"
            required
            mono
            value={form.phoneNumber}
            onChange={update('phoneNumber')}
            placeholder="+977 9XXXXXXXXX"
          />
          <Input
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={update('password')}
            placeholder="At least 8 characters"
          />
          <Textarea
            label="Address"
            value={form.address}
            onChange={update('address')}
            placeholder="Bagmati Province, Kathmandu"
          />
          <Button type="submit" disabled={submitting} size="lg" className="mt-1">
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
