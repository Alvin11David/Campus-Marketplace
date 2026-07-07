import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { LogIn, Eye, EyeOff, Loader2, XCircle, Clock, ShieldAlert } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { motion, AnimatePresence } from "framer-motion";

const SUSPENDED_EMAILS = ["suspended@students.vu.ac.ug"];
const MAX_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 30000;

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [errorType, setErrorType] = useState<"invalid" | "rate_limit" | "suspended">("invalid");
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!lockedUntil) return;
    if (Date.now() >= lockedUntil) {
      setLockedUntil(null);
      setAttempts(0);
      return;
    }
    const timer = setTimeout(() => {
      setLockedUntil(null);
      setAttempts(0);
    }, lockedUntil - Date.now());
    return () => clearTimeout(timer);
  }, [lockedUntil]);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const isLocked = lockedUntil && Date.now() < lockedUntil;
  const remainingSeconds = lockedUntil ? Math.ceil((lockedUntil - Date.now()) / 1000) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLocked) return;

    if (!email || !password) {
      setError("Please fill in all fields");
      setErrorType("invalid");
      return;
    }

    if (SUSPENDED_EMAILS.includes(email.toLowerCase())) {
      setError("This account has been suspended. Please contact support for assistance.");
      setErrorType("suspended");
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      if (newAttempts >= MAX_ATTEMPTS) {
        setErrorType("rate_limit");
        setError(`Too many login attempts. Please try again in ${LOCKOUT_DURATION_MS / 1000} seconds.`);
        setLockedUntil(Date.now() + LOCKOUT_DURATION_MS);
      } else {
        setErrorType("invalid");
        setError(`Invalid email or password. ${MAX_ATTEMPTS - newAttempts} attempt${MAX_ATTEMPTS - newAttempts === 1 ? "" : "s"} remaining.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const errorVariant = errorType === "suspended" ? "default" : "destructive";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-primary/5 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Log in to your Campus Marketplace account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={errorType + error}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                >
                  <Alert variant={errorVariant} className={errorType === "suspended" ? "border-amber-200 bg-amber-50 dark:bg-amber-950/40" : "border-destructive/20"}>
                    {errorType === "rate_limit" ? <Clock className="h-4 w-4" /> :
                     errorType === "suspended" ? <ShieldAlert className="h-4 w-4" /> :
                     <XCircle className="h-4 w-4" />}
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="you@students.vu.ac.ug"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
              disabled={!!loading || !!isLocked}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : isLocked ? (
                <>
                  <Clock className="mr-2 h-4 w-4" />
                  Try again in {remainingSeconds}s
                </>
              ) : (
                "Log In"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Register
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
