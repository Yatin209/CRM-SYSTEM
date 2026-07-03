import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, LogIn, Mail, Sparkles, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import Button from "../components/common/Button.jsx";
import FormField from "../components/common/FormField.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required").min(8, "Minimum 8 characters"),
  remember: z.boolean().optional(),
});

const isDev = import.meta.env.MODE === "development" || !import.meta.env.PROD;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: false },
  });

  const remember = watch("remember");

  if (user) return <Navigate to="/dashboard" replace />;

  function onSubmit(values) {
    setLoading(true);
    try { if (login(values)) navigate("/dashboard", { replace: true }); }
    finally { setLoading(false); }
  }

  return (
    <main className="login-screen">
      <div className="login-bg-pattern" aria-hidden="true" />
      <section className="login-panel">

        {/* Brand */}
        <div className="login-brand">
          <span className="login-brand-icon"><Sparkles size={22} /></span>
          <div>
            <strong>NexaCRM</strong>
            <small>Customer Relationship Management</small>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          <h1>Welcome back</h1>
          <p className="login-sub">Sign in to your workspace</p>

          <FormField label="Email Address" error={errors.email}>
            <div className="input-with-icon">
              <Mail size={16} />
              <input {...register("email")} type="email" placeholder="you@company.com"
                autoComplete="email" autoFocus />
            </div>
          </FormField>

          <FormField label="Password" error={errors.password}>
            <div className="input-with-icon password-input-wrapper">
              <LockKeyhole size={16} />
              <input {...register("password")} type={showPw ? "text" : "password"}
                placeholder="••••••••" autoComplete="current-password" />
              <button type="button" className="icon-toggle"
                onClick={() => setShowPw(p => !p)}
                aria-label={showPw ? "Hide" : "Show"} tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          {/* Remember + Forgot */}
          <div className="login-row">
            <div className="remember-wrap">
              <label className="check-row">
                <input type="checkbox" {...register("remember")} />
                <span>Remember me</span>
              </label>
              {remember && <p className="remember-hint">Stay signed in on this device</p>}
            </div>
            <Link to="/forgot-password" className="link-text">Forgot password?</Link>
          </div>

          <Button type="submit" icon={loading ? undefined : LogIn} className="w-100"
            disabled={loading || isSubmitting}>
            {loading || isSubmitting
              ? <><span className="spinner" />Signing in…</>
              : "Sign In"}
          </Button>

          {/* Security note */}
          <div className="security-note">
            <ShieldCheck size={13} />
            Secure encrypted login · Protected by JWT Authentication
          </div>
        </form>

        {/* Dev-only demo credentials */}
        {isDev && (
          <details className="demo-section">
            <summary>Demo Credentials</summary>
            <p className="demo-hint">Click a role to auto-fill</p>
            <div className="role-pills">
              {[
                { label: "Admin",   email: "admin@nexacrm.com" },
                { label: "Manager", email: "manager@nexacrm.com" },
                { label: "Sales",   email: "sales@nexacrm.com" },
                { label: "Support", email: "support@nexacrm.com" },
              ].map(({ label, email }) => (
                <button key={email} type="button"
                  onClick={() => { setValue("email", email); setValue("password", "Nexa@123"); }}>
                  {label}
                </button>
              ))}
            </div>
          </details>
        )}

        <footer className="login-footer">
          <small>© 2026 NexaCRM &nbsp;·&nbsp; Version 1.0</small>
        </footer>
      </section>
    </main>
  );
}
