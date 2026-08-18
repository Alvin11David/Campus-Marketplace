import { useState, useRef, useCallback, Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, CheckCircle2, Loader2, Mail, Check, X, RefreshCw, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackButton } from "@/components/shared/back-button";
import { GravityStarsBackground } from "@/components/backgrounds/gravity-stars-background";
import { cn } from "@/lib/utils";

import { apiPost } from "@/lib/api";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CODE_LENGTH = 6;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const codeRefs = useRef<(HTMLInputElement | null)[]>(Array(CODE_LENGTH).fill(null));

  const emailValid = touched && EMAIL_REGEX.test(email);
  const emailInvalid = touched && email.length > 0 && !EMAIL_REGEX.test(email);
  const codeFilled = code.every((d) => d !== "");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouched(true);

    if (!email || !EMAIL_REGEX.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/forgot-password", { email });
      setStep("code");
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      await apiPost("/auth/forgot-password", { email });
      setCode(Array(CODE_LENGTH).fill(""));
      setResendCooldown(30);
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) { clearInterval(timer); return 0; }
          return prev - 1;
        });
      }, 1000);
      codeRefs.current[0]?.focus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeChange = useCallback((index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(0, 1);
    }
    if (value && !/^\d$/.test(value)) return;

    setError("");
    setCode((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });

    if (value && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  }, []);

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!text) return;
    setCode((prev) => {
      const next = [...prev];
      for (let i = 0; i < text.length; i++) {
        next[i] = text[i];
      }
      return next;
    });
    const target = text.length < CODE_LENGTH ? text.length : CODE_LENGTH - 1;
    codeRefs.current[target]?.focus();
  };

  const handleVerifyCode = async () => {
    if (!codeFilled) return;
    setError("");
    setLoading(true);
    try {
      await apiPost("/auth/verify-otp", { email, otp: code.join("") });
      setLoading(false);
      navigate("/reset-password", { state: { email, otp: code.join("") } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid code. Please try again.");
      setCode(Array(CODE_LENGTH).fill(""));
      codeRefs.current[0]?.focus();
      setLoading(false);
    }
  };

  const emailStep = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-primary/5 shadow-xl">
        <CardHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10"
          >
            <KeyRound className="h-6 w-6 text-primary" />
          </motion.div>
          <CardTitle className="text-xl">Forgot password?</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a 6-digit code to reset it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendCode} className="space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="destructive" className="border-destructive/20">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="you@students.vu.ac.ug"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  onBlur={() => setTouched(true)}
                  autoComplete="email"
                  required
                  className={cn(
                    "h-11 pr-10 transition-all duration-200",
                    emailValid && "ring-2 ring-emerald-500/20 border-emerald-500/50",
                    emailInvalid && "ring-2 ring-destructive/20 border-destructive/50"
                  )}
                />
                <AnimatePresence>
                  {emailValid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <Check className="h-4 w-4 text-emerald-500" />
                    </motion.div>
                  )}
                  {emailInvalid && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {emailInvalid && (
                <p className="text-xs text-destructive">Please enter a valid email address</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Code"
              )}
            </Button>

            <div className="flex justify-center">
              <BackButton fallback="/login" label="Back to Login" />
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );

  const codeStep = (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-primary/5 shadow-xl overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-primary to-secondary" />
        <CardContent className="pt-8 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
            className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 shadow-lg shadow-primary/10"
          >
            <ShieldCheck className="h-8 w-8 text-primary" />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-bold text-center mb-1"
          >
            Check your email
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-sm text-muted-foreground text-center mb-6"
          >
            We sent a 6-digit code to <strong className="text-foreground">{email}</strong>
          </motion.p>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4"
              >
                <Alert variant="destructive" className="border-destructive/20">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-center gap-2 mb-6" onPaste={handlePaste}>
            {code.map((digit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Input
                  ref={(el) => { codeRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  onKeyDown={(e) => handleCodeKeyDown(i, e)}
                  onFocus={(e) => e.target.select()}
                  autoComplete="one-time-code"
                  className={cn(
                    "h-14 w-11 sm:w-12 text-center text-lg font-bold rounded-xl transition-all duration-200",
                    "focus:ring-2 focus:ring-primary/30 focus:border-primary",
                    digit ? "border-primary/50 bg-primary/5" : "border-input",
                  )}
                />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button
              className="w-full h-11 gap-2"
              onClick={handleVerifyCode}
              disabled={!codeFilled || loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...</>
              ) : (
                <><ArrowRight className="h-4 w-4" /> Verify Code</>
              )}
            </Button>

            <div className="flex items-center justify-between">
              <BackButton fallback="/login" label="Back" />
              <button
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className="text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw className={cn("h-3 w-3", loading && "animate-spin")} />
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend code"}
              </button>
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Fragment>
      <GravityStarsBackground className="fixed inset-0 -z-10" />
      <div className="relative z-10 w-full">
        {step === "code" ? codeStep : emailStep}
      </div>
    </Fragment>
  );
}
