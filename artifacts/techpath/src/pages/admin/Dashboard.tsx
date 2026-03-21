import { useState } from "react";
import { useAdminListUsers, useAdminListJobs } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Users, Briefcase, Activity, CheckCircle, XCircle, Clock, ShieldAlert } from "lucide-react";

export default function AdminDashboard() {
  const { data: users, isLoading: usersLoading } = useAdminListUsers();
  const { data: jobsData, isLoading: jobsLoading } = useAdminListJobs();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const pendingRecruiters = users?.filter(
    (u: any) => u.role === "recruiter" && !u.verified
  ) ?? [];

  const verifiedRecruiters = users?.filter(
    (u: any) => u.role === "recruiter" && u.verified
  ) ?? [];

  const handleVerify = async (id: number, name: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/verify`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to verify");
      toast({ title: `${name} has been approved as a recruiter.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: number, name: string) => {
    if (!confirm(`Remove ${name}'s account? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/reject`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed to reject");
      toast({ title: `${name}'s account has been removed.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch {
      toast({ title: "Action failed", variant: "destructive" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Platform Administration</h1>
        <p className="text-muted-foreground mt-1">Global oversight of all TechPath activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Users</p>
            <h3 className="text-3xl font-bold">{users?.length ?? 0}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Jobs</p>
            <h3 className="text-3xl font-bold">{jobsData?.total ?? 0}</h3>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Verified Recruiters</p>
            <h3 className="text-3xl font-bold">{verifiedRecruiters.length}</h3>
          </div>
        </div>
        <div className={`border rounded-2xl p-6 shadow-sm flex items-center gap-4 ${pendingRecruiters.length > 0 ? "bg-amber-50 border-amber-200" : "bg-card border-border"}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${pendingRecruiters.length > 0 ? "bg-amber-500" : "bg-muted"}`}>
            <Clock className={`w-6 h-6 ${pendingRecruiters.length > 0 ? "text-white" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className={`text-sm ${pendingRecruiters.length > 0 ? "text-amber-700" : "text-muted-foreground"}`}>Pending Approval</p>
            <h3 className={`text-3xl font-bold ${pendingRecruiters.length > 0 ? "text-amber-700" : ""}`}>{pendingRecruiters.length}</h3>
          </div>
        </div>
      </div>

      {pendingRecruiters.length > 0 && (
        <section className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h2 className="font-bold text-lg text-amber-800">Recruiter Accounts Awaiting Verification</h2>
            <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingRecruiters.length} pending
            </span>
          </div>
          <div className="divide-y divide-amber-100">
            {pendingRecruiters.map((u: any) => (
              <div key={u.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-semibold text-foreground">{u.name}</p>
                  <p className="text-sm text-muted-foreground">{u.email}</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    Registered {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleVerify(u.id, u.name)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(u.id, u.name)}
                    disabled={actionLoading === u.id}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-4">All Users</h2>
          <div className="space-y-3">
            {usersLoading ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)
            ) : (
              users?.slice(0, 8).map((u: any) => (
                <div key={u.id} className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
                  <div>
                    <div className="font-medium text-foreground">{u.name}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.role === "recruiter" && (
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                        {u.verified ? "verified" : "pending"}
                      </span>
                    )}
                    <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-foreground text-background">
                      {u.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold mb-4 border-b border-border pb-4">Recent Jobs</h2>
          <div className="space-y-3">
            {jobsLoading ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)
            ) : (
              jobsData?.jobs.slice(0, 8).map((j: any) => (
                <div key={j.id} className="flex justify-between items-center bg-muted/30 p-4 rounded-xl border border-border">
                  <div>
                    <div className="font-medium text-foreground">{j.title}</div>
                    <div className="text-xs text-muted-foreground">{j.company} · {j.recruiterName}</div>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg ${j.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {j.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
