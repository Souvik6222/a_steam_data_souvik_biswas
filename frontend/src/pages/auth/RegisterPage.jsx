import React, { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import AuthLayout from '../../layouts/AuthLayout';
import toast from 'react-hot-toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading, error, clearAuthErrors } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      clearAuthErrors();
    }
  }, [error, clearAuthErrors]);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'user',
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(2, 'Name must be at least 2 characters')
        .required('Name is required'),
      email: Yup.string()
        .email('Please enter a valid email')
        .required('Email is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Passwords must match')
        .required('Please confirm your password'),
    }),
    onSubmit: async (values) => {
      toast.loading('Creating your account...', { id: 'auth-loading' });
      const success = await register(values.name, values.email, values.password, values.role);
      toast.dismiss('auth-loading');
      if (success) {
        toast.success('Account created successfully!');
        navigate('/dashboard', { replace: true });
      }
    },
  });

  return (
    <AuthLayout headline={"Join the\nNEXUS network."}>
      <div className="flex flex-col">
        {/* Header */}
        <header className="mb-8">
          <h2 className="text-xs font-headline font-semibold text-text-muted uppercase tracking-widest mb-2">
            Get started
          </h2>
          <h3 className="text-2xl font-headline font-bold text-text-primary tracking-tight">
            Create your account
          </h3>
          <div className="w-12 h-[2px] bg-gradient-to-r from-primary to-accent mt-3 rounded-full" />
        </header>

        {/* Register Form */}
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary" htmlFor="name">
              Full Name
            </label>
            <div className="relative group">
              <input
                id="name" name="name" type="text" placeholder="John Doe"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.name}
                className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary/60 transition-colors pointer-events-none text-xl">person</span>
            </div>
            {formik.touched.name && formik.errors.name && (
              <p className="text-danger text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>{formik.errors.name}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <input
                id="email" name="email" type="text" placeholder="you@example.com"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.email}
                className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary/60 transition-colors pointer-events-none text-xl">mail</span>
            </div>
            {formik.touched.email && formik.errors.email && (
              <p className="text-danger text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>{formik.errors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary" htmlFor="password">
              Password
            </label>
            <div className="relative group">
              <input
                id="password" name="password" type="password" placeholder="••••••••"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.password}
                className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary/60 transition-colors pointer-events-none text-xl">lock</span>
            </div>
            {formik.touched.password && formik.errors.password && (
              <p className="text-danger text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>{formik.errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative group">
              <input
                id="confirmPassword" name="confirmPassword" type="password" placeholder="••••••••"
                onChange={formik.handleChange} onBlur={formik.handleBlur} value={formik.values.confirmPassword}
                className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-text-muted/40 group-focus-within:text-primary/60 transition-colors pointer-events-none text-xl">verified_user</span>
            </div>
            {formik.touched.confirmPassword && formik.errors.confirmPassword && (
              <p className="text-danger text-xs flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">error</span>{formik.errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Role selector */}
          <div className="space-y-1.5">
            <label className="block text-xs font-headline font-semibold uppercase tracking-wider text-text-secondary" htmlFor="role">
              Role
            </label>
            <select
              id="role" name="role"
              onChange={formik.handleChange} value={formik.values.role}
              className="w-full bg-surface/60 backdrop-blur-sm border border-border-light rounded-xl px-4 py-3 text-sm text-text-primary focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              className="w-full nexus-btn-gradient text-white font-headline font-semibold text-sm py-4 px-6 rounded-xl shadow-glow transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
              type="submit" disabled={loading}
            >
              {loading ? (
                <><span className="material-symbols-outlined text-base animate-spin">progress_activity</span>Creating account...</>
              ) : (
                <>Create Account<span className="material-symbols-outlined text-base">arrow_forward</span></>
              )}
            </button>
          </div>

          <div className="text-center text-xs text-text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-light hover:text-primary transition-colors font-semibold">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
