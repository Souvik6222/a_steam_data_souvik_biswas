import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import BrutalistButton from '../../components/BrutalistButton';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading, error, clearAuthErrors } = useAuth();

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthErrors();
    }
  }, [error, clearAuthErrors]);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Please enter a valid email address')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
    }),
    onSubmit: async (values) => {
      toast.loading('Signing in...', { id: 'auth-loading' });
      const success = await login(values.email, values.password);
      toast.dismiss('auth-loading');
      if (success) {
        toast.success('Welcome back!');
        navigate(from, { replace: true });
      }
    },
  });

  return (
    <AuthLayout headline={"Explore gaming\nanalytics."}>
      <div className="flex flex-col">
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-xs font-headline font-semibold text-text-muted uppercase tracking-widest mb-2">
            Welcome back
          </h2>
          <h3 className="text-2xl font-headline font-bold text-text-primary tracking-tight">
            Sign in to NEXUS
          </h3>
          <div className="w-12 h-[2px] bg-gradient-to-r from-primary to-accent mt-3 rounded-full" />
        </header>

        {/* Login Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label
              className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary"
              htmlFor="email"
            >
              Email Address
            </label>
            <div className="relative group">
              <input
                id="email"
                name="email"
                type="text"
                placeholder="you@example.com"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
                className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary/60 transition-colors pointer-events-none text-xl">
                mail
              </span>
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-danger text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>
                {formik.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label
              className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative group">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••••"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3.5 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary/60 transition-colors pointer-events-none text-xl">
                lock
              </span>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-danger text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>
                {formik.errors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              className="w-full nexus-btn-gradient text-white font-headline font-semibold text-sm py-4 px-6 rounded-xl shadow-glow transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </>
              )}
            </button>
          </div>

          {/* Links */}
          <div className="flex justify-between items-center text-xs text-text-muted">
            <Link className="hover:text-primary transition-colors" to="/forgot-password">
              Forgot password?
            </Link>
            <Link className="hover:text-primary text-primary-light transition-colors font-semibold" to="/register">
              Create account
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
