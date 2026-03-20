import { useAdminListUsers, useAdminListJobs } from "@workspace/api-client-react";
import { Users, Briefcase, Activity } from "lucide-react";

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useAdminListUsers();
  const { data: jobsData, isLoading: jobsLoading } = useAdminListJobs();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-destructive">Platform Administration</h1>
        <p className="text-muted-foreground mt-1">Global oversight of all TechPath activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border-l-4 border-l-blue-500 rounded-r-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Users</p>
              <h3 className="text-4xl font-bold mt-2">{users?.length || 0}</h3>
            </div>
            <Users className="w-8 h-8 text-blue-500/50" />
          </div>
        </div>
        <div className="bg-card border-l-4 border-l-green-500 rounded-r-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Jobs</p>
              <h3 className="text-4xl font-bold mt-2">{jobsData?.total || 0}</h3>
            </div>
            <Briefcase className="w-8 h-8 text-green-500/50" />
          </div>
        </div>
        <div className="bg-card border-l-4 border-l-purple-500 rounded-r-2xl p-6 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-muted-foreground">System Status</p>
              <h3 className="text-4xl font-bold mt-2 text-green-500">Online</h3>
            </div>
            <Activity className="w-8 h-8 text-purple-500/50" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-card border border-border p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-4">Recent Users</h2>
          <div className="space-y-4">
            {users?.slice(0, 5).map(u => (
              <div key={u.id} className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border">
                <div>
                  <div className="font-medium text-foreground">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <span className="px-2 py-1 text-xs font-bold uppercase rounded bg-secondary text-secondary-foreground">
                  {u.role}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-card border border-border p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4 border-b border-border pb-4">Recent Jobs</h2>
          <div className="space-y-4">
            {jobsData?.jobs.slice(0, 5).map(j => (
              <div key={j.id} className="flex justify-between items-center bg-background/50 p-4 rounded-xl border border-border">
                <div>
                  <div className="font-medium text-foreground">{j.title}</div>
                  <div className="text-xs text-muted-foreground">{j.company}</div>
                </div>
                <span className={`px-2 py-1 text-xs font-bold uppercase rounded ${j.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {j.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

    </div>
  );
}
