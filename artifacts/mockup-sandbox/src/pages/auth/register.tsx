import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import {
  UserPlus, Loader2, CheckCircle2, XCircle, Eye, EyeOff,
  User, Mail, Phone, Lock, ShieldCheck, Sparkles, ArrowRight,
  GraduationCap, Star, MessageSquare,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const benefits = [
  { icon: GraduationCap, text: "Student-verified community", desc: "Connect with real VU students" },
  { icon: Star, text: "Trusted ratings & reviews", desc: "Know who you're dealing with" },
  { icon: MessageSquare, text: "Built-in messaging", desc: "Chat without leaving the platform" },
];

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (!pw) return { label: "", color: "", width: "0%" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 6 && score === 0) score = 1;
  if (score <= 1) return { label: "Weak", color: "bg-destructive", width: "25%" };
  if (score <= 2) return { label: "Fair", color: "bg-warning", width: "50%" };
  if (score <= 3) return { label: "Good", color: "bg-primary", width: "75%" };
  return { label: "Strong", color: "bg-success", width: "100%" };
}

const inputIcons = {
  fullName: User,
  email: Mail,
  phone: Phone,
  password: Lock,
  confirmPassword: Lock,
} as const;

type FieldId = keyof typeof inputIcons;

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState<Record<FieldId, boolean>>({
    fullName: false, email: false, phone: false,
    password: false, confirmPassword: false,
  });
  const [focused, setFocused] = useState<FieldId | null>(null);

  useEffect(() => {
    if (isAuthenticated) navigate("/onboarding", { replace: true });
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) return <Navigate to="/onboarding" replace />;

  const validEmail = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const strength = getPasswordStrength(password);
  const full = { fullName, email, phone, password, confirmPassword };
  const allFilled = Object.values(full).every((v) => v.length > 0);

  const getFieldError = (id: FieldId): string | undefined => {
    if (!touched[id]) return undefined;
    switch (id) {
      case "email": return email.length > 0 && !validEmail ? "Invalid email address" : undefined;
      case "password": return password.length > 0 && password.length < 8 ? "Min. 8 characters" : undefined;
      case "confirmPassword": return confirmPassword.length > 0 && password !== confirmPassword ? "Passwords do not match" : undefined;
      default: return undefined;
    }
  };

  const isFieldValid = (id: FieldId): boolean => {
    if (!touched[id]) return false;
    switch (id) {
      case "fullName": return fullName.length > 0;
      case "email": return validEmail;
      case "phone": return phone.length > 3;
      case "password": return password.length >= 8;
      case "confirmPassword": return password === confirmPassword && password.length >= 8;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!allFilled) { setError("Please fill in all fields"); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await register({ full_name: fullName, email, phone, password });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderField = (id: FieldId, label: string, type: string, placeholder: string, autoComplete: string) => {
    const value = (full as Record<string, string>)[id];
    const setter = (v: string) => {
      const setters = { fullName: setFullName, email: setEmail, phone: setPhone, password: setPassword, confirmPassword: setConfirmPassword };
      setters[id](v);
    };
    const error = getFieldError(id);
    const valid = isFieldValid(id);
    const isFocused = focused === id;
    const Icon = inputIcons[id];

    return (
      <motion.div variants={itemVariants} className="space-y-1.5">
        <label htmlFor={id} className={cn(
          "text-sm font-medium transition-colors duration-200",
          error ? "text-destructive" : isFocused ? "text-primary" : "text-foreground/80"
        )}>{label}</label>
        <div className="relative group">
          <div className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 z-10 transition-all duration-200",
            isFocused ? "text-primary" : error ? "text-destructive" : "text-muted-foreground/60"
          )}>
            <Icon className="h-4 w-4" />
          </div>
          <Input
            id={id}
            type={
              id === "password" ? (showPassword ? "text" : "password") :
              id === "confirmPassword" ? (showConfirm ? "text" : "password") : type
            }
            placeholder={placeholder}
            value={value}
            onChange={(e) => setter(e.target.value)}
            onFocus={() => setFocused(id)}
            onBlur={() => { setFocused(null); setTouched((p) => ({ ...p, [id]: true })); }}
            autoComplete={autoComplete}
            required
            className={cn(
              "h-11 pl-10 pr-10 transition-all duration-200",
              "bg-background/50 backdrop-blur-sm",
              "border-input/60 focus-visible:border-primary/50",
              "focus-visible:ring-2 focus-visible:ring-primary/20",
              error && "border-destructive/70 focus-visible:border-destructive focus-visible:ring-destructive/20",
              valid && !error && "border-success/70 focus-visible:border-success focus-visible:ring-success/20",
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {(id === "password" || id === "confirmPassword") && (
              <button
                type="button"
                onClick={() => id === "password" ? setShowPassword(!showPassword) : setShowConfirm(!showConfirm)}
                className="text-muted-foreground/60 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {(id === "password" ? showPassword : showConfirm) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
            {error && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
            {valid && !error && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
          </div>
        </div>
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              key={id + error}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="text-xs text-destructive flex items-center gap-1"
            >
              <XCircle className="h-3 w-3 inline" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        {id === "password" && password.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="space-y-1"
          >
            <div className="flex gap-1 h-1">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: strength.width }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={cn("rounded-full transition-all", strength.color)}
              />
            </div>
            <p className={cn("text-[10px] font-medium tracking-wide uppercase", strength.color.replace("bg-", "text-"))}>
              {strength.label}
            </p>
          </motion.div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto lg:grid lg:grid-cols-5 lg:gap-10 items-start">
      {/* Sidebar - hidden on mobile */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className="hidden lg:flex flex-col gap-6 lg:col-span-2 lg:sticky lg:top-8"
      >
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight leading-tight">
            Join your<br />
            <span className="text-primary">campus community</span>
          </h2>
          <p className="text-sm text-muted-foreground/80 leading-relaxed">
            Connect with trusted students offering services and products right on campus.
          </p>
        </div>

        <div className="space-y-5">
          {benefits.map((b, i) => (
            <motion.div
              key={b.text}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <b.icon className="h-4.5 w-4.5" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground/90">{b.text}</p>
                <p className="text-xs text-muted-foreground/70 mt-0.5">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-primary/10 bg-gradient-to-br from-primary/[0.03] to-transparent p-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
            <p className="text-xs text-muted-foreground/70">
              Victoria University students only
            </p>
          </div>
        </div>
      </motion.div>

      {/* Card */}
      <motion.div
        className="lg:col-span-3 mt-6 lg:mt-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Card className="relative overflow-hidden border-primary/10 shadow-2xl shadow-primary/5 bg-card/95 backdrop-blur-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-secondary/[0.02] pointer-events-none" />
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-48 w-48 rounded-full bg-secondary/5 blur-3xl pointer-events-none" />

          <CardContent className="p-6 sm:p-8 relative">
            <div className="text-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/25"
              >
                <UserPlus className="h-6 w-6 text-primary-foreground" />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-xl font-bold"
              >
                Create your account
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-sm text-muted-foreground mt-1"
              >
                Join the Campus Marketplace community
              </motion.p>
            </div>

            <form onSubmit={handleSubmit}>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div
                      key={error}
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                    >
                      <Alert variant="destructive" className="border-destructive/20 bg-destructive/5">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                {renderField("fullName", "Full Name", "text", "John Doe", "name")}
                {renderField("email", "Email", "email", "you@students.vu.ac.ug", "email")}
                {renderField("phone", "Phone Number", "tel", "+256 XXX XXX XXX", "tel")}
                {renderField("password", "Password", "password", "Create a strong password", "new-password")}
                {renderField("confirmPassword", "Confirm Password", "password", "Re-enter your password", "new-password")}

                <motion.div variants={itemVariants}>
                  <Button
                    type="submit"
                    size="lg"
                    className={cn(
                      "w-full h-11 mt-2 text-base",
                      "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
                      "transition-all duration-300 active:scale-[0.98]",
                      "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary",
                      "relative overflow-hidden group"
                    )}
                    disabled={loading}
                  >
                    <span className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                    <span className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                      ) : (
                        <><Sparkles className="h-4 w-4" /> Create Account <ArrowRight className="h-4 w-4" /></>
                      )}
                    </span>
                  </Button>
                </motion.div>

                <motion.div variants={itemVariants} className="text-center pt-1">
                  <p className="text-sm text-muted-foreground/80">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-primary hover:text-primary/80 transition-colors group"
                    >
                      Sign in
                      <ArrowRight className="h-3 w-3 inline ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </p>
                </motion.div>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
