import React from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import toast from 'react-hot-toast';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    toast.success('If that email exists, a reset link has been sent.');
    setSubmitted(true);
  };

  return (
    <AuthLayout headline={"Reset your\npassword."}>
      <div className="flex flex-col">
        <header className="mb-8">
          <h2 className="text-xs font-headline font-semibold text-text-muted uppercase tracking-widest mb-2">
            Account recovery
          </h2>
          <h3 className="text-2xl font-headline font-bold text-text-primary tracking-tight">
            Forgot your password?
          </h3>
          <div className="w-12 h-[2px] bg-gradient-to-r from-primary to-accent mt-3 rounded-full" />
          <p className="text-sm text-text-muted mt-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </header>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="email" type="email" placeholder="you@example.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary/60 transition-colors pointer-events-none text-xl">mail</span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full nexus-btn-gradient text-white font-headline font-semibold text-sm py-4 px-6 rounded-xl shadow-glow transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2 cursor-pointer"
            >
              Send Reset Link
              <span className="material-symbols-outlined text-base">send</span>
            </button>

            <div className="text-center text-xs text-text-muted">
              Remember your password?{' '}
              <Link to="/login" className="text-primary-light hover:text-primary transition-colors font-semibold">
                Sign in
              </Link>
            </div>
          </form>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-3xl text-success">check_circle</span>
            </div>
            <p className="text-sm text-text-secondary">
              We've sent a reset link to <strong className="text-text-primary">{email}</strong>.
              Check your inbox and follow the instructions.
            </p>
            <Link to="/login" className="inline-flex items-center gap-2 text-primary-light hover:text-primary text-sm font-semibold transition-colors">
              <span className="material-symbols-outlined text-base">arrow_back</span>
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
