import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Briefcase, User, LayoutDashboard, FileText, LogOut, Menu, X, Flag, PlusCircle } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getNavLinks = () => {
    if (!user) return [];
    if (user.role === "admin") {
      return [
        { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ];
    }
    if (user.role === "recruiter") {
      return [
        { href: "/recruiter", label: "Dashboard", icon: LayoutDashboard },
        { href: "/recruiter/post-job", label: "Post Job", icon: PlusCircle },
        { href: "/recruiter/applications", label: "Applications", icon: FileText },
        { href: "/report", label: "Report Issue", icon: Flag },
      ];
    }
    return [
      { href: "/jobs", label: "Find Jobs", icon: Briefcase },
      { href: "/applications", label: "My Applications", icon: FileText },
      { href: "/resume", label: "Resume Builder", icon: FileText },
      { href: "/profile", label: "Profile", icon: User },
      { href: "/report", label: "Report Issue", icon: Flag },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <Briefcase className="w-4 h-4 text-background" />
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-foreground">
                TechPath
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-foreground ${
                      isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}

              <div className="flex items-center gap-4 ml-4 pl-4 border-l border-border">
                {user ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground hidden lg:block">{user.name}</span>
                    <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Sign In
                    </Link>
                    <Link href="/register" className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-all">
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-muted-foreground">
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-border bg-card overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              {user ? (
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-muted-foreground hover:bg-muted"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 text-muted-foreground">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2 bg-foreground text-background rounded-lg">
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col relative">
        {children}
      </main>

      <footer className="border-t border-border bg-background py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            <span className="font-display font-semibold text-lg">TechPath</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} TechPath Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
