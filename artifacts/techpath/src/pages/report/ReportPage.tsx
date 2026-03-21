import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flag, Send, Clock, CheckCircle, MessageSquare, ChevronDown, ChevronUp } from "lucide-react";

const SUBJECTS = [
  "Job posting seems fraudulent",
  "Inappropriate content",
  "Account or login issue",
  "Technical bug or error",
  "Resume builder problem",
  "Application process issue",
  "Incorrect job information",
  "Other",
];

const STATUS_STYLES: Record<string, string> = {
  open: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  in_progress: "bg-blue-50 text-blue-700 border border-blue-200",
  resolved: "bg-green-50 text-green-700 border border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export default function ReportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: myReports, isLoading } = useQuery({
    queryKey: ["/api/reports/my"],
    queryFn: async () => {
      const res = await fetch("/api/reports/my");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Submission failed");
      }
      toast({ title: "Report submitted! Our team will get back to you shortly." });
      setMessage("");
      setSubject(SUBJECTS[0]);
      queryClient.invalidateQueries({ queryKey: ["/api/reports/my"] });
    } catch (err: any) {
      toast({ title: "Failed to submit", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <Flag className="w-12 h-12 mx-auto mb-4 opacity-20" />
        <h2 className="text-xl font-bold">Sign in to submit a report</h2>
        <p className="text-muted-foreground mt-2">You need to be logged in to contact our support team.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 w-full space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Report an Issue</h1>
        <p className="text-muted-foreground mt-1">
          Have a problem or query? Our team will review and respond as soon as possible.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
            <Send className="w-5 h-5 text-background" />
          </div>
          <div>
            <h2 className="font-bold text-lg">New Report</h2>
            <p className="text-sm text-muted-foreground">Describe your issue clearly so we can help faster.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Subject</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-foreground outline-none transition-all text-sm"
            >
              {SUBJECTS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Describe your issue</label>
            <textarea
              required
              minLength={10}
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-foreground outline-none transition-all text-sm resize-none"
              placeholder="Please be as detailed as possible — include any relevant job titles, links, or steps that led to the issue..."
            />
            <p className="text-xs text-muted-foreground text-right">{message.length}/2000</p>
          </div>

          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl border border-border text-sm text-muted-foreground">
            <MessageSquare className="w-4 h-4 shrink-0" />
            Reporting as <span className="font-semibold text-foreground">{user.name}</span> ({user.email})
          </div>

          <button
            type="submit"
            disabled={isSubmitting || message.length < 10}
            className="w-full py-3 rounded-xl font-semibold bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50 transition-all"
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </form>
      </div>

      {/* Past Reports */}
      <div>
        <h2 className="text-xl font-bold mb-4">Your Previous Reports</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />)}
          </div>
        ) : !myReports || myReports.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground border border-dashed border-border rounded-2xl">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p>You haven't submitted any reports yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myReports.map((r: any) => (
              <div key={r.id} className="bg-card border border-border rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                >
                  <div className="flex items-center gap-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[r.status] ?? ""}`}>
                      {STATUS_LABELS[r.status] ?? r.status}
                    </span>
                    <div>
                      <p className="font-semibold text-sm">{r.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(r.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  {expandedId === r.id ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>

                {expandedId === r.id && (
                  <div className="px-6 pb-5 space-y-4 border-t border-border">
                    <div className="mt-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Your Message</p>
                      <p className="text-sm text-foreground leading-relaxed">{r.message}</p>
                    </div>
                    {r.adminReply && (
                      <div className="bg-muted/50 border border-border rounded-xl p-4">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          TechPath Team Response
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">{r.adminReply}</p>
                      </div>
                    )}
                    {!r.adminReply && (
                      <p className="text-xs text-muted-foreground italic">Our team hasn't replied yet. We'll get back to you soon.</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
