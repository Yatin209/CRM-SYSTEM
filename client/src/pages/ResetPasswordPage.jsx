import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import Button from "../components/common/Button.jsx";
import FormField from "../components/common/FormField.jsx";
import { http } from "../api/http.js";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must contain at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[!@#$%^&*]/, "Must contain at least one special character (!@#$%^&*)"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

function Brand() {
  return (
    <div className="login-brand">
      <span className="login-brand-icon">
        <Sparkles size={22} />
      </span>
      <div>
        <strong>NexaCRM</strong>
        <small>Customer Relationship Management</small>
      </div>
    </div>
  );
}

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const token = searchParams.get("token");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await http.post("/auth/reset-password", {
        token,
        password: values.password,
      });
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to reset password. The link may have expired."
      );
    }
  }

  if (!token) {
    return (
      <main className="login-screen">
        <div className="login-bg-pattern" aria-hidden="true" />
        <section className="login-panel">
          <Brand />
          <div style={{ textAlign: "center", padding: "28px 0" }}>
            <p style={{ color: "var(--coral)", fontWeight: 600 }}>Invalid or expired reset link</p>
            <p style={{ color: "var(--muted)", marginTop: 8 }}>Please request a new password reset link.</p>
            <Link to="/forgot-password" className="btn-link" style={{ justifyContent: "center" }}>
              Request New Link
            </Link>
          </div>
        </section>
      </main>
    );
  }

  if (done) {
    return (
      <main className="login-screen">
        <div className="login-bg-pattern" aria-hidden="true" />
        <section className="login-panel">
          <Brand />
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <h2>Password Updated</h2>
            <p>Your password has been reset successfully.</p>
            <Link to="/login" className="btn-link" style={{ justifyContent: "center" }}>
              Sign In Now
            </Link>
          </div>
          <footer className="login-footer">
            <small>© 2026 NexaCRM &nbsp;·&nbsp; Version 1.0</small>
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main className="login-screen">
      <div className="login-bg-pattern" aria-hidden="true" />
      <section className="login-panel">
        <Brand />

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <h1>Set New Password</h1>
          <p className="form-description">Create a strong password to secure your account.</p>

          <FormField label="New Password" error={errors.password}>
            <div className="input-with-icon password-input-wrapper">
              <LockKeyhole size={16} />
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="icon-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <FormField label="Confirm Password" error={errors.confirmPassword}>
            <div className="input-with-icon password-input-wrapper">
              <LockKeyhole size={16} />
              <input
                {...register("confirmPassword")}
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="icon-toggle"
                onClick={() => setShowConfirm(!showConfirm)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </FormField>

          <div className="password-requirements">
            <strong>Password must contain:</strong>
            <ul>
              <li>At least 8 characters</li>
              <li>One uppercase letter (A-Z)</li>
              <li>One number (0-9)</li>
              <li>One special character (!@#$%^&*)</li>
            </ul>
          </div>

          <Button
            type="submit"
            icon={LockKeyhole}
            className="w-100"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner" />
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>

        <footer className="login-footer">
          <small>© 2026 NexaCRM &nbsp;·&nbsp; Version 1.0</small>
        </footer>
      </section>
    </main>
  );
}

export default ResetPasswordPage;
