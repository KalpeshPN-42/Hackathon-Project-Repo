import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { User, Building, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { RegisterRequestRole } from "@workspace/api-client-react";

export default function Register() {
  const { register, user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<RegisterRequestRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      const redirect = user.role === "admin" ? "/admin" : user.role === "recruiter" ? "/recruiter" : "/jobs";
      setLocation(redirect);
    }
  }, [user, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({ email, password, name, role });
      toast({ title: "Account created successfully! Welcome to TechPath." });
      const redirect = role === "recruiter" ? "/recruiter" : "/profile";
      setLocation(redirect);
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "An error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="bg-card border border-border rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-display font-bold">Join TechPath</h1>
            <p className="text-muted-foreground mt-2">Create your account and start your journey.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">I am a...</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    role === "student"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40 text-muted-foreground"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-semibold">Student / Professional</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    role === "recruiter"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border hover:border-foreground/40 text-muted-foreground"
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span className="text-sm font-semibold">Recruiter / Company</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {role === "recruiter" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold mb-1">Recruiter accounts require verification</p>
                      <p className="text-amber-700">
                        After registering, your account will be reviewed by our team before you can post job listings.
                        This helps us protect students from fraudulent postings.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-foreground focus:ring-0 transition-all outline-none"
                placeholder="John Doe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-foreground focus:ring-0 transition-all outline-none"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-foreground focus:ring-0 transition-all outline-none"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 mt-4 rounded-xl font-semibold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-all duration-200"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-foreground hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
