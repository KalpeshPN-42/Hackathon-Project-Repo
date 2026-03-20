import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowRight, Code, FileText, ShieldCheck, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 md:opacity-30 mix-blend-screen pointer-events-none">
          <img 
            src={`${import.meta.env.BASE_URL}images/hero-abstract.png`} 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-3xl mx-auto space-y-8"
          >
            <div className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary border border-primary/20 backdrop-blur-md">
              <Zap className="w-4 h-4 mr-2" />
              The #1 Platform for Engineering Talent
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-extrabold tracking-tight text-white leading-tight">
              Launch Your Tech Career <br/>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
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
                  className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto text-center"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link 
                    href="/register"
                    className="px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto text-center flex items-center justify-center gap-2"
                  >
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link 
                    href="/login"
                    className="px-8 py-4 rounded-xl font-semibold bg-secondary border border-border text-foreground hover:bg-secondary/80 transition-all duration-300 w-full sm:w-auto text-center"
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
      <section className="py-24 bg-card/50 border-y border-border relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Built for the Modern Techie</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              Everything you need to accelerate your job search in one unified platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-background rounded-2xl p-8 border border-border hover:border-primary/50 transition-colors duration-300 shadow-xl shadow-black/20">
              <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6">
                <Code className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Tech Matching</h3>
              <p className="text-muted-foreground leading-relaxed">
                Filter roles by specific programming languages, frameworks, and tools. Find the stack you love.
              </p>
            </div>
            
            <div className="bg-background rounded-2xl p-8 border border-border hover:border-accent/50 transition-colors duration-300 shadow-xl shadow-black/20">
              <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">ATS-Friendly Resumes</h3>
              <p className="text-muted-foreground leading-relaxed">
                Generate highly optimized resumes from your profile data instantly. Beat the automated screeners.
              </p>
            </div>
            
            <div className="bg-background rounded-2xl p-8 border border-border hover:border-green-500/50 transition-colors duration-300 shadow-xl shadow-black/20">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-green-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Verified Recruiters</h3>
              <p className="text-muted-foreground leading-relaxed">
                Apply with confidence. All companies and recruiters on TechPath are vetted for quality.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Preview Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative aspect-[16/9] md:aspect-auto md:h-[500px]">
             <img 
              src={`${import.meta.env.BASE_URL}images/platform-preview.png`} 
              alt="Platform Preview" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-center">
              <h2 className="text-3xl font-display font-bold mb-4">Ready to start your journey?</h2>
              {!user && (
                <Link href="/register" className="inline-block px-8 py-3 rounded-lg bg-white text-black font-semibold hover:bg-gray-200 transition-colors">
                  Create Free Account
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
