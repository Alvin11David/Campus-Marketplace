import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Store, Package, ArrowRight, Check, Sparkles, ChevronRight } from "lucide-react";
import { BackButton } from "@/components/shared/back-button";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/auth-context";
import { apiPatch, fetchLocations } from "@/lib/api";
import type { CampusLocation } from "@/lib/api";
import { cn } from "@/lib/utils";

const STEPS = ["Location", "Roles"];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [campusLocationId, setCampusLocationId] = useState<string>(
    user?.campus_location_id ? String(user.campus_location_id) : ""
  );
  const [isProvider, setIsProvider] = useState(user?.is_provider ?? false);
  const [isSeller, setIsSeller] = useState(user?.is_seller ?? false);
  const [locations, setLocations] = useState<CampusLocation[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchLocations().then(setLocations); }, []);

  const handleContinue = async () => {
    if (step === 0) {
      if (!campusLocationId) return;
      setStep(1);
      return;
    }
    setSaving(true);
    try {
      await apiPatch("/users/me", { campusLocationId: Number(campusLocationId) });
      await apiPatch("/users/me/roles", { isProvider, isSeller });
      await refreshUser();
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSkip = () => {
    navigate("/dashboard", { replace: true });
  };

  const location = locations.find((l) => l.id === Number(campusLocationId));

  return (
    <div className="min-h-screen bg-background flex items-start sm:items-center justify-center p-4 relative pt-16 sm:pt-4">
      <div className="absolute top-4 left-4">
        <BackButton fallback="/login" label="Back" />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full max-w-lg"
      >
        {/* Branding */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25"
          >
            <Sparkles className="h-7 w-7 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome to CampusMarket</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
            Two quick steps to personalize your experience
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300",
                i === step
                  ? "bg-primary/10 text-primary font-medium"
                  : i < step
                    ? "bg-emerald-50 text-emerald-600"
                    : "text-muted-foreground/40"
              )}>
                {i < step ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <span className="text-xs font-bold">{i + 1}</span>
                )}
                <span className="text-xs">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn(
                  "h-px w-6 transition-colors duration-300",
                  i < step ? "bg-emerald-300" : "bg-muted-foreground/20"
                )} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <motion.div
          layout
          className="rounded-2xl border bg-card shadow-xl shadow-primary/5 overflow-hidden"
        >
          <AnimatePresence mode="wait">
            {step === 0 ? (
              <motion.div
                key="step-0"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">Where are you based?</h2>
                    <p className="text-sm text-muted-foreground">
                      This helps show you listings near your campus
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Select value={campusLocationId} onValueChange={setCampusLocationId}>
                    <SelectTrigger className={cn("h-12", !campusLocationId && "text-muted-foreground")}>
                      <SelectValue placeholder="Select your campus location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc.id} value={String(loc.id)}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {loc.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {location && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="rounded-xl bg-gradient-to-r from-primary/5 to-secondary/5 border border-primary/10 p-4 flex items-center gap-3"
                  >
                    <MapPin className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{location.name}</p>
                      <p className="text-xs text-muted-foreground">Zone: {location.zone}</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={handleSkip} className="text-xs text-muted-foreground">
                    Skip setup
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={!campusLocationId}
                    className="gap-2"
                  >
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="p-6 space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <Store className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg">What are you here for?</h2>
                    <p className="text-sm text-muted-foreground">
                      Choose how you want to participate
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsProvider(!isProvider)}
                    className={cn(
                      "relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                      isProvider
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/30 hover:bg-accent/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          isProvider ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}>
                          <Store className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Offer Services</p>
                          <p className="text-xs text-muted-foreground">
                            Tutoring, repairs, printing, beauty, and more
                          </p>
                        </div>
                      </div>
                      <Switch checked={isProvider} onCheckedChange={setIsProvider} />
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setIsSeller(!isSeller)}
                    className={cn(
                      "relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200",
                      isSeller
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-border hover:border-primary/30 hover:bg-accent/30"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                          isSeller ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                        )}>
                          <Package className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">Sell Products</p>
                          <p className="text-xs text-muted-foreground">
                            Textbooks, snacks, accessories, and goods
                          </p>
                        </div>
                      </div>
                      <Switch checked={isSeller} onCheckedChange={setIsSeller} />
                    </div>
                  </motion.div>
                </div>

                {!isProvider && !isSeller && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-xs text-muted-foreground text-center"
                  >
                    You can still browse and buy. You can always change this later.
                  </motion.p>
                )}

                <div className="flex items-center justify-between pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setStep(0)} className="gap-1 text-xs">
                    <ChevronRight className="h-3.5 w-3.5 rotate-180" />
                    Back
                  </Button>
                  <Button
                    onClick={handleContinue}
                    disabled={saving}
                    className="gap-2"
                  >
                    {saving ? (
                      "Setting up..."
                    ) : (
                      <>
                        Complete Setup
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          You can update your preferences anytime from your profile settings
        </p>
      </motion.div>
    </div>
  );
}
