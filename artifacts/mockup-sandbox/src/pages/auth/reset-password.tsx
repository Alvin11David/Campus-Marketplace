import { useState } from "react";
import { Link, useLocation, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { KeyRound, Eye, EyeOff, CheckCircle2, Loader2, Lock, Check, X, ArrowRight } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiPost } from "@/lib/api";
import { cn } from "@/lib/utils";

function getStrength(password: string): { score: number; label: string; color: string; bg: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-destructive", bg: "bg-destructive/10" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500", bg: "bg-orange-500/10" };
  if (score <= 3) return { score, label: "Good", color: "bg-amber-500", bg: "bg-amber-500/10" };
  if (score <= 4) return { score, label: "Strong", color: "bg-emerald-500", bg: "bg-emerald-500/10" };
  return { score, label: "Very Strong", color: "bg-emerald-600", bg: "bg-emerald-600/10" };
}

interface LocationState {
  email?: string;
  otp?: string;
}

export default function ResetPassword() {
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [touchedPassword, setTouchedPassword] = useState(false);
  const [touchedConfirm, setTouchedConfirm] = useState(false);

  if (!state?.email || !state?.otp) {
    return <Navigate to="/forgot-password" replace />;
  }

  const strength = getStrength(password);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;
  const passwordsMismatch = touchedConfirm && confirmPassword.length > 0 && password !== confirmPassword;
  const passwordValid = touchedPassword && password.length >= 8;
  const passwordInvalid = touchedPassword && password.length > 0 && password.length < 8;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTouchedPassword(true);
    setTouchedConfirm(true);

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiPost("/auth/reset-password", {
        email: state.email,
        otp: state.otp,
        newPassword: password,
        passwordConfirmation: confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-md mx-auto"
      >
        <Card className="border-primary/5 shadow-xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-400 to-emerald-600" />
          <CardContent className="pt-8 pb-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
              className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-950/20 shadow-lg shadow-emerald-500/20"
            >
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold mb-2"
            >
              Password reset successful
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground mb-6"
            >
              Your password has been updated. You can now log in with your new password.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button asChild className="w-full">
                <Link to="/login">Log In <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
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
            <Lock className="h-6 w-6 text-primary" />
          </motion.div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <CardDescription>Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label htmlFor="password" className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  onBlur={() => setTouchedPassword(true)}
                  autoComplete="new-password"
                  required
                  className={cn(
                    "h-11 pr-20 transition-all duration-200",
                    passwordValid && "ring-2 ring-emerald-500/20 border-emerald-500/50",
                    passwordInvalid && "ring-2 ring-destructive/20 border-destructive/50"
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-0.5"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <AnimatePresence>
                    {passwordValid && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                    )}
                    {passwordInvalid && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <X className="h-4 w-4 text-destructive" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {password.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-1"
                >
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(strength.score / 5) * 100}%` }}
                      transition={{ duration: 0.3 }}
                      className={cn("h-full rounded-full transition-colors", strength.color)}
                    />
                  </div>
                  <p className={cn("text-[11px] font-medium", strength.bg, "px-1.5 py-0.5 rounded inline-block")}>
                    {strength.label}
                  </p>
                </motion.div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirm-password" className="text-sm font-medium">Confirm New Password</label>
              <div className="relative">
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  onBlur={() => setTouchedConfirm(true)}
                  autoComplete="new-password"
                  required
                  className={cn(
                    "h-11 pr-10 transition-all duration-200",
                    passwordsMatch && "ring-2 ring-emerald-500/20 border-emerald-500/50",
                    passwordsMismatch && "ring-2 ring-destructive/20 border-destructive/50"
                  )}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <AnimatePresence>
                    {passwordsMatch && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <Check className="h-4 w-4 text-emerald-500" />
                      </motion.div>
                    )}
                    {passwordsMismatch && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                        <X className="h-4 w-4 text-destructive" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              {passwordsMismatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting...</>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
          <div className="flex justify-center mt-4">
            <BackButton fallback="/login" label="Back to Login" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
