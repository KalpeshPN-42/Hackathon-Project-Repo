import { useListJobs, useRecruiterListApplications } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Briefcase, Users, PlusCircle, ExternalLink } from "lucide-react";

export default function RecruiterDashboard() {
  // Using public listJobs assuming API filters implicitly, or just showing all for MVP if missing explicit endpoint
  const { data: jobsResponse, isLoading: jobsLoading } = useListJobs({ limit: 50 });
  const { data: apps, isLoading: appsLoading } = useRecruiterListApplications();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold">Recruiter Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your job postings and applicants.</p>
        </div>
        <Link 
          href="/recruiter/post-job"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
        >
          <PlusCircle className="w-5 h-5" />
          Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg flex items-center gap-4">
          <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
            <Briefcase className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Postings</p>
            <h3 className="text-3xl font-bold">{jobsResponse?.total || 0}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg flex items-center gap-4">
          <div className="w-14 h-14 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Applicants</p>
            <h3 className="text-3xl font-bold">{apps?.length || 0}</h3>
          </div>
        </div>
      </div>

      {/* Applications list */}
      <section className="bg-card border border-border rounded-3xl p-8 shadow-xl">
        <h2 className="text-xl font-bold border-b border-border pb-4 mb-6">Recent Applications</h2>
        {appsLoading ? (
           <div className="animate-pulse space-y-4">
             <div className="h-12 bg-background rounded-lg"></div>
             <div className="h-12 bg-background rounded-lg"></div>
           </div>
        ) : apps?.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No applications received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-muted-foreground uppercase bg-background/50">
                <tr>
                  <th className="px-6 py-3 font-medium rounded-tl-lg">Applicant</th>
                  <th className="px-6 py-3 font-medium">Role</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                  <th className="px-6 py-3 font-medium rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apps?.slice(0, 10).map(app => (
                  <tr key={app.id} className="hover:bg-background/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{app.applicantName}</td>
                    <td className="px-6 py-4">{app.job?.title}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary uppercase">
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/recruiter/applications`} className="text-primary hover:underline font-medium">
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
