import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { AuthProvider } from "./hooks/use-auth";
import { Layout } from "./components/Layout";

import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import JobsFeed from "./pages/jobs/JobsFeed";
import JobDetail from "./pages/jobs/JobDetail";
import ProfileSetup from "./pages/student/ProfileSetup";
import Applications from "./pages/student/Applications";
import ResumeBuilder from "./pages/student/ResumeBuilder";
import RecruiterDashboard from "./pages/recruiter/Dashboard";
import PostJob from "./pages/recruiter/PostJob";
import RecruiterApplications from "./pages/recruiter/Applications";
import AdminDashboard from "./pages/admin/Dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Layout>
      <Switch>
        {/* Public routes */}
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Shared / Public Jobs */}
        <Route path="/jobs" component={JobsFeed} />
        <Route path="/jobs/:id" component={JobDetail} />

        {/* Student Routes */}
        <Route path="/profile" component={ProfileSetup} />
        <Route path="/applications" component={Applications} />
        <Route path="/resume" component={ResumeBuilder} />

        {/* Recruiter Routes */}
        <Route path="/recruiter" component={RecruiterDashboard} />
        <Route path="/recruiter/post-job" component={PostJob} />
        <Route path="/recruiter/applications" component={RecruiterApplications} />

        {/* Admin Routes */}
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={AdminDashboard} />
        <Route path="/admin/jobs" component={AdminDashboard} />

        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
