import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { z } from "zod";
import Button from "../components/common/Button.jsx";
import FormField from "../components/common/FormField.jsx";
import { http } from "../api/http.js";

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
});

function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(values) {
    try {
      await http.post("/auth/forgot-password", { email: values.email });
      setSubmittedEmail(values.email);
      setSubmitted(true);
      toast.success("Password reset link sent — check your inbox");
    } catch {
      // Always show the same message regardless to avoid user enumeration
      setSubmittedEmail(values.email);
      setSubmitted(true);
      toast.info("If that email is registered, a reset link has been sent");
    }
  }

  return (
    <main className="login-screen">
      <div className="login-bg-pattern" aria-hidden="true" />

      <section className="login-panel">
        <div className="login-brand">
          <span className="login-brand-icon">
            <Sparkles size={22} />
          </span>
          <div>
            <strong>NexaCRM</strong>
            <small>Customer Relationship Management</small>
          </div>
        </div>

        {submitted ? (
          <div className="reset-success">
            <div className="success-icon">✓</div>
            <h2>Check Your Email</h2>
            <p>
              We&apos;ve sent a password reset link to{" "}
              <strong>{submittedEmail}</strong>
            </p>
            <p className="small-text">
              The link expires in 30 minutes. Check your spam folder if you
              don&apos;t see it.
            </p>
            <Link to="/login" className="btn-link">
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="login-form">
            <h1>Reset Password</h1>
            <p className="form-description">
              Enter your account email and we&apos;ll send you a secure reset link.
            </p>

            <FormField label="Email Address" error={errors.email}>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="your.email@company.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </FormField>

            <Button
              type="submit"
              icon={Send}
              className="w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            <div className="form-links">
              <Link to="/login" className="link-text">
                <ArrowLeft size={14} />
                Back to Sign In
              </Link>
            </div>
          </form>
        )}

        <footer className="login-footer">
          <small>© 2026 NexaCRM &nbsp;·&nbsp; Version 1.0</small>
        </footer>
      </section>
    </main>
  );
}

export default ForgotPasswordPage;
