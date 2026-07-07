import { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import { UserPlus, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/onboarding", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  const passwordError = password.length > 0 && password.length < 8 ? "Password must be at least 8 characters" : "";
  const confirmError = confirmPassword.length > 0 && password !== confirmPassword ? "Passwords do not match" : "";
  const validEmail = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !phone || !password || !confirmPassword) {
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
      await register({ full_name: fullName, email, phone, password });
      navigate("/onboarding", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Field = ({
    id,
    label,
    type,
    placeholder,
    value,
    onChange,
    onBlur,
    autoComplete,
    error,
    valid,
  }: {
    id: string;
    label: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (v: string) => void;
    onBlur: () => void;
    autoComplete: string;
    error?: string;
    valid?: boolean;
  }) => (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <Input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          autoComplete={autoComplete}
          required
          className={`h-11 pr-10 ${error ? "border-destructive" : valid ? "border-success" : ""}`}
        />
        {error && (
          <XCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
        {valid && !error && (
          <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-success" />
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );

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
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Create an account</CardTitle>
          <CardDescription>Join the Campus Marketplace community</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Alert variant="destructive" className="border-destructive/20">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            <Field
              id="full_name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={setFullName}
              onBlur={() => setTouched((p) => ({ ...p, fullName: true }))}
              autoComplete="name"
              valid={touched.fullName && fullName.length > 0}
            />

            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="you@students.vu.ac.ug"
              value={email}
              onChange={setEmail}
              onBlur={() => setTouched((p) => ({ ...p, email: true }))}
              autoComplete="email"
              error={touched.email && email.length > 0 && !validEmail ? "Invalid email address" : undefined}
              valid={touched.email && validEmail}
            />

            <Field
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+256..."
              value={phone}
              onChange={setPhone}
              onBlur={() => setTouched((p) => ({ ...p, phone: true }))}
              autoComplete="tel"
              valid={touched.phone && phone.length > 3}
            />

            <Field
              id="password"
              label="Password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={setPassword}
              onBlur={() => setTouched((p) => ({ ...p, password: true }))}
              autoComplete="new-password"
              error={touched.password && passwordError ? passwordError : undefined}
              valid={touched.password && password.length >= 8}
            />

            <Field
              id="confirm_password"
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              onBlur={() => setTouched((p) => ({ ...p, confirmPassword: true }))}
              autoComplete="new-password"
              error={touched.confirmPassword && confirmError ? confirmError : undefined}
              valid={touched.confirmPassword && password === confirmPassword && password.length >= 8}
            />

            <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-[0.98]" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground/80 dark:text-muted-foreground/90">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:text-primary/80 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
