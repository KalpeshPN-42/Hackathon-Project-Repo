import { useListApplications } from "@workspace/api-client-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import { Building2, MapPin, ExternalLink, Activity } from "lucide-react";

export default function Applications() {
  const { data: apps, isLoading } = useListApplications();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "reviewing": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "shortlisted": return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "offered": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "rejected": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-display font-bold">My Applications</h1>
        <p className="text-muted-foreground mt-2">Track the status of your job and internship applications.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-card animate-pulse rounded-2xl" />)}
        </div>
      ) : apps?.length === 0 ? (
        <div className="bg-card border border-border p-12 rounded-3xl text-center max-w-2xl mx-auto">
          <Activity className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">No applications yet</h3>
          <p className="text-muted-foreground mb-6">Start applying to jobs to build your career.</p>
          <Link href="/jobs" className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors">
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {apps?.map((app) => (
            <div key={app.id} className="bg-card border border-border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-primary/30 transition-colors shadow-lg shadow-black/5">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold">{app.job?.title || "Unknown Role"}</h3>
                  <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${getStatusColor(app.status)}`}>
                    {app.status}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5 font-medium text-foreground">
                    <Building2 className="w-4 h-4" /> {app.job?.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" /> {app.job?.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    Applied {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              <Link 
                href={`/jobs/${app.jobId}`}
                className="px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shrink-0"
              >
                View Job <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
