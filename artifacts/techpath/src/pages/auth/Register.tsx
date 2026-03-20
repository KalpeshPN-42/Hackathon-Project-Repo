import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, User, Building, Shield } from "lucide-react";
import { motion } from "framer-motion";
import type { RegisterRequestRole } from "@workspace/api-client-react";

export default function Register() {
  const { register } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<RegisterRequestRole>("student");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await register({ email, password, name, role });
      toast({ title: "Account created successfully!" });
    } catch (err: any) {
      toast({ 
        title: "Registration Failed", 
        description: err.message || "An error occurred",
        variant: "destructive"
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
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    role === "student" 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:border-border/80 text-muted-foreground"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="text-xs font-semibold">Student / Pro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("recruiter")}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    role === "recruiter" 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:border-border/80 text-muted-foreground"
                  }`}
                >
                  <Building className="w-5 h-5" />
                  <span className="text-xs font-semibold">Recruiter</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("admin")}
                  className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    role === "admin" 
                      ? "border-primary bg-primary/10 text-primary" 
                      : "border-border hover:border-border/80 text-muted-foreground"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="text-xs font-semibold">Admin</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <input 
                type="text" 
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
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
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
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
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                placeholder="••••••••"
              />
              <p className="text-xs text-muted-foreground">Must be at least 8 characters.</p>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full px-4 py-3 mt-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none transition-all duration-200"
            >
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
