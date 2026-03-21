import { useState } from "react";
import { useAdminListUsers, useAdminListJobs } from "@workspace/api-client-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Users, Briefcase, CheckCircle, XCircle, Clock,
  ShieldAlert, Flag, ChevronDown, ChevronUp, Send, Trash2,
} from "lucide-react";

type TabId = "overview" | "users" | "jobs" | "reports";

const STATUS_STYLES: Record<string, string> = {
  open: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  resolved: "bg-green-50 text-green-700 border border-green-200",
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const { data: users, isLoading: usersLoading } = useAdminListUsers();
  const { data: jobsData, isLoading: jobsLoading } = useAdminListJobs();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [expandedReport, setExpandedReport] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<Record<number, string>>({});
  const [replyStatus, setReplyStatus] = useState<Record<number, string>>({});

  const { data: reports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports"],
    queryFn: async () => {
      const res = await fetch("/api/reports");
      if (!res.ok) throw new Error("Unauthorized");
      return res.json() as Promise<any[]>;
    },
  });

  const pendingRecruiters = (users as any[])?.filter(u => u.role === "recruiter" && !u.verified) ?? [];
  const openReports = reports?.filter(r => r.status !== "resolved") ?? [];

  async function handleVerify(id: number, name: string) {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}/verify`, { method: "PATCH" });
      if (!res.ok) throw new Error();
      toast({ title: `${name} approved as recruiter.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch { toast({ title: "Action failed", variant: "destructive" }); }
    finally { setActionLoading(null); }
  }

  async function handleRemoveUser(id: number, name: string) {
    if (!confirm(`Remove ${name}'s account permanently? This cannot be undone.`)) return;
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast({ title: `${name}'s account has been removed.` });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
    } catch { toast({ title: "Action failed", variant: "destructive" }); }
    finally { setActionLoading(null); }
  }

  async function handleReply(reportId: number) {
    const text = replyText[reportId] || "";
    const status = replyStatus[reportId] || "in_progress";
    if (!text.trim()) return;
    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}/reply`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminReply: text, status }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Reply sent successfully." });
      setReplyText(prev => ({ ...prev, [reportId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    } catch { toast({ title: "Failed to send reply", variant: "destructive" }); }
    finally { setActionLoading(null); }
  }

  const tabs: { id: TabId; label: string; icon: any; badge?: number }[] = [
    { id: "overview", label: "Overview", icon: Briefcase },
    { id: "users", label: "Users", icon: Users, badge: pendingRecruiters.length || undefined },
    { id: "jobs", label: "Jobs", icon: Briefcase },
    { id: "reports", label: "Reports", icon: Flag, badge: openReports.length || undefined },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage users, jobs, and user-submitted reports.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.badge ? (
              <span className="ml-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                {tab.badge}
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Users", value: (users as any[])?.length ?? 0 },
              { label: "Total Jobs", value: jobsData?.total ?? 0 },
              { label: "Pending Recruiters", value: pendingRecruiters.length },
              { label: "Open Reports", value: openReports.length },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-5 shadow-sm">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          {pendingRecruiters.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-amber-800">{pendingRecruiters.length} recruiter(s) awaiting approval</h3>
                <button onClick={() => setActiveTab("users")} className="ml-auto text-xs text-amber-700 underline">View all</button>
              </div>
              {pendingRecruiters.slice(0, 2).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2">
                  <span className="text-sm text-amber-900 font-medium">{u.name} <span className="text-amber-600 font-normal">· {u.email}</span></span>
                  <div className="flex gap-2">
                    <button onClick={() => handleVerify(u.id, u.name)} disabled={actionLoading === u.id} className="px-3 py-1 bg-green-600 text-white text-xs rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50">Approve</button>
                    <button onClick={() => handleRemoveUser(u.id, u.name)} disabled={actionLoading === u.id} className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg font-semibold hover:bg-red-700 disabled:opacity-50">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {openReports.length > 0 && (
            <div className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Flag className="w-5 h-5 text-red-500" />
                <h3 className="font-bold">{openReports.length} open report(s) need attention</h3>
                <button onClick={() => setActiveTab("reports")} className="ml-auto text-xs text-muted-foreground underline">View all</button>
              </div>
              {openReports.slice(0, 3).map((r: any) => (
                <div key={r.id} className="flex items-center justify-between py-2 border-t border-border first:border-t-0">
                  <div>
                    <p className="text-sm font-medium">{r.subject}</p>
                    <p className="text-xs text-muted-foreground">{r.userName} · {r.userRole}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div className="space-y-6">
          {pendingRecruiters.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-amber-200 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-600" />
                <h2 className="font-bold text-amber-800">Pending Recruiter Approvals</h2>
                <span className="ml-auto bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{pendingRecruiters.length}</span>
              </div>
              <div className="divide-y divide-amber-100">
                {pendingRecruiters.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <p className="font-semibold">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleVerify(u.id, u.name)} disabled={actionLoading === u.id} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50">
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => handleRemoveUser(u.id, u.name)} disabled={actionLoading === u.id} className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50">
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center gap-2">
              <Users className="w-5 h-5" />
              <h2 className="font-bold text-lg">All Users</h2>
              <span className="ml-auto text-sm text-muted-foreground">{(users as any[])?.length ?? 0} total</span>
            </div>
            {usersLoading ? (
              <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
            ) : (
              <div className="divide-y divide-border">
                {(users as any[])?.map(u => (
                  <div key={u.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                    <div>
                      <p className="font-medium">{u.name}</p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {u.role === "recruiter" && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.verified ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          {u.verified ? "verified" : "pending"}
                        </span>
                      )}
                      <span className="px-2.5 py-1 text-xs font-bold uppercase rounded-lg bg-foreground text-background">{u.role}</span>
                      <button
                        onClick={() => handleRemoveUser(u.id, u.name)}
                        disabled={actionLoading === u.id}
                        title="Remove user"
                        className="p-2 text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === "jobs" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            <h2 className="font-bold text-lg">All Job Listings</h2>
            <span className="ml-auto text-sm text-muted-foreground">{jobsData?.total ?? 0} total</span>
          </div>
          {jobsLoading ? (
            <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted animate-pulse rounded-xl" />)}</div>
          ) : (
            <div className="divide-y divide-border">
              {jobsData?.jobs.map((j: any) => (
                <div key={j.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/20 transition-colors">
                  <div>
                    <p className="font-medium">{j.title}</p>
                    <p className="text-sm text-muted-foreground">{j.company} · posted by {j.recruiterName}</p>
                  </div>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase rounded-lg ${j.status === "active" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}>
                    {j.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{reports?.length ?? 0} total reports · {openReports.length} open</p>
          </div>

          {reportsLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-2xl" />)}</div>
          ) : !reports || reports.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground border border-dashed border-border rounded-2xl">
              <Flag className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No reports yet</p>
            </div>
          ) : (
            reports.map((r: any) => (
              <div key={r.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}
                >
                  <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status] ?? ""}`}>
                    {r.status.replace("_", " ")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{r.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.userName} · {r.userRole} · {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  {expandedReport === r.id ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
                </button>

                {expandedReport === r.id && (
                  <div className="px-6 pb-6 space-y-5 border-t border-border pt-4">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Message from {r.userName} ({r.userEmail})</p>
                      <p className="text-sm leading-relaxed">{r.message}</p>
                    </div>

                    {r.adminReply && (
                      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" /> Your Previous Reply
                        </p>
                        <p className="text-sm text-green-900">{r.adminReply}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        {r.adminReply ? "Update Reply" : "Reply to this report"}
                      </p>
                      <textarea
                        rows={3}
                        value={replyText[r.id] ?? ""}
                        onChange={e => setReplyText(prev => ({ ...prev, [r.id]: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-foreground outline-none transition-all text-sm resize-none"
                        placeholder="Type your response to the user..."
                      />
                      <div className="flex items-center gap-3">
                        <select
                          value={replyStatus[r.id] ?? r.status}
                          onChange={e => setReplyStatus(prev => ({ ...prev, [r.id]: e.target.value }))}
                          className="px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none"
                        >
                          <option value="open">Keep Open</option>
                          <option value="in_progress">Mark In Progress</option>
                          <option value="resolved">Mark Resolved</option>
                        </select>
                        <button
                          onClick={() => handleReply(r.id)}
                          disabled={actionLoading === r.id || !(replyText[r.id] || "").trim()}
                          className="flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-semibold rounded-lg hover:bg-foreground/90 disabled:opacity-50 transition-all"
                        >
                          <Send className="w-4 h-4" />
                          {actionLoading === r.id ? "Sending..." : "Send Reply"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
