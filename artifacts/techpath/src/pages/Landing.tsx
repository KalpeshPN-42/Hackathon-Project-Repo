import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Code, FileText, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-secondary text-foreground border border-border">
              <Zap className="w-4 h-4 mr-2" />
              The #1 Platform for Engineering Talent
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-foreground leading-tight">
              Launch Your Tech Career <br/>
              <span className="text-muted-foreground">
                Without Limits
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with top tech companies, build an ATS-friendly resume instantly, and land your dream engineering internship or full-time role.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              {user ? (
                <Link 
                  href={user.role === "student" ? "/jobs" : `/${user.role}`}
                  className="px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 w-full sm:w-auto text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/register"
                    className="px-8 py-4 rounded-xl font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                  >
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    href="/login"
                    className="px-8 py-4 rounded-xl font-semibold bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all duration-200 w-full sm:w-auto text-center"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-secondary/40 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">Built for the Modern Techie</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Everything you need to accelerate your job search in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-2xl p-8 border border-border hover:border-foreground/30 transition-colors duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Smart Tech Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Filter roles by specific programming languages, frameworks, and tools. Find the stack you love.
              </p>
            </div>
            
            <div className="bg-background rounded-2xl p-8 border border-border hover:border-foreground/30 transition-colors duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">ATS-Friendly Resumes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate highly optimized resumes from your profile data instantly. Beat the automated screeners.
              </p>
            </div>
            
            <div className="bg-background rounded-2xl p-8 border border-border hover:border-foreground/30 transition-colors duration-300 shadow-sm">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground">Verified Recruiters</h3>
              <p className="text-muted-foreground leading-relaxed">
                Apply with confidence. All companies and recruiters on TechPath are vetted for quality.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Ready to start your journey?</h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto">
            Join thousands of engineers who found their dream roles through TechPath.
          </p>
          {!user && (
            <Link 
              href="/register" 
              className="inline-block px-8 py-4 rounded-xl bg-background text-foreground font-semibold hover:bg-background/90 transition-colors"
            >
              Create Free Account
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
