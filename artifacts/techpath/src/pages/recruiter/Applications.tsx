import { useRecruiterListApplications } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Users, Clock, CheckCircle, XCircle, ArrowLeft } from "lucide-react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  reviewing: "bg-blue-50 text-blue-700 border border-blue-200",
  accepted: "bg-green-50 text-green-700 border border-green-200",
  rejected: "bg-red-50 text-red-700 border border-red-200",
  withdrawn: "bg-gray-100 text-gray-500 border border-gray-200",
};

const STATUS_ICONS: Record<string, any> = {
  pending: Clock,
  reviewing: Clock,
  accepted: CheckCircle,
  rejected: XCircle,
  withdrawn: XCircle,
};

export default function RecruiterApplications() {
  const { user } = useAuth();
  const { data: apps, isLoading } = useRecruiterListApplications();

  if (!user || user.role !== "recruiter") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-2">This page is only for recruiters.</p>
      </div>
    );
  }

  const stats = {
    total: apps?.length ?? 0,
    pending: apps?.filter(a => a.status === "pending").length ?? 0,
    reviewing: apps?.filter(a => a.status === "reviewing").length ?? 0,
    accepted: apps?.filter(a => a.status === "accepted").length ?? 0,
    rejected: apps?.filter(a => a.status === "rejected").length ?? 0,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/recruiter" className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-display font-bold">Applications</h1>
          <p className="text-muted-foreground mt-1">All applicants across your job postings.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "bg-black text-white" },
          { label: "Pending", value: stats.pending, color: "bg-yellow-50 text-yellow-800 border border-yellow-200" },
          { label: "Accepted", value: stats.accepted, color: "bg-green-50 text-green-800 border border-green-200" },
          { label: "Rejected", value: stats.rejected, color: "bg-red-50 text-red-800 border border-red-200" },
        ].map(stat => (
          <div key={stat.label} className={`rounded-2xl p-5 ${stat.color}`}>
            <p className="text-sm font-medium opacity-75">{stat.label}</p>
            <p className="text-3xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center gap-3">
          <Users className="w-5 h-5" />
          <h2 className="font-bold text-lg">All Applications</h2>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : !apps || apps.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-medium">No applications yet</p>
            <p className="text-sm mt-1">Applications will appear here once candidates apply to your jobs.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <th className="px-6 py-3 text-left font-medium">Applicant</th>
                  <th className="px-6 py-3 text-left font-medium">Position</th>
                  <th className="px-6 py-3 text-left font-medium">Applied</th>
                  <th className="px-6 py-3 text-left font-medium">Status</th>
                  <th className="px-6 py-3 text-left font-medium">Cover Letter</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {apps.map(app => {
                  const Icon = STATUS_ICONS[app.status ?? "pending"] ?? Clock;
                  return (
                    <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">{app.applicantName}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{app.applicantEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{app.job?.title ?? "—"}</div>
                        <div className="text-muted-foreground text-xs mt-0.5">{app.job?.company}</div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[app.status ?? "pending"] ?? ""}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {app.status ? app.status.charAt(0).toUpperCase() + app.status.slice(1) : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {app.coverLetter ? (
                          <span
                            className="text-foreground underline underline-offset-2 cursor-pointer text-xs"
                            title={app.coverLetter}
                          >
                            View
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
