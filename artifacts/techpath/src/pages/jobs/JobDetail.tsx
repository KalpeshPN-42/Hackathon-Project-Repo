import { useParams, useLocation } from "wouter";
import { useGetJob, useCreateApplication } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";
import { MapPin, DollarSign, Clock, Briefcase, ArrowLeft, Building2, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

export default function JobDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const { data: job, isLoading, error } = useGetJob(Number(id));
  const createApplication = useCreateApplication();

  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading job details...</div>;
  if (error || !job) return <div className="p-8 text-center text-destructive">Job not found.</div>;

  const handleApply = async () => {
    if (!user) {
      setLocation("/login");
      return;
    }
    
    try {
      await createApplication.mutateAsync({
        data: {
          jobId: job.id,
          coverLetter: coverLetter.trim() || undefined
        }
      });
      toast({ title: "Application submitted successfully!" });
      setIsApplying(false);
      setCoverLetter("");
    } catch (err: any) {
      toast({ title: "Failed to apply", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/jobs" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to jobs
      </Link>

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-border bg-gradient-to-b from-primary/5 to-transparent relative">
          <div className="flex flex-col md:flex-row justify-between gap-6 items-start md:items-center">
            <div>
              <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <Building2 className="w-5 h-5" /> {job.company}
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                {job.title}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border">
                  <MapPin className="w-4 h-4" /> {job.location} {job.isRemote && "(Remote)"}
                </div>
                <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border">
                  <Briefcase className="w-4 h-4" /> {job.type}
                </div>
                {(job.minPay || job.maxPay) && (
                  <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border text-green-500">
                    <DollarSign className="w-4 h-4" /> 
                    ${job.minPay?.toLocaleString() || 0} - ${job.maxPay?.toLocaleString() || "Max"}
                  </div>
                )}
                <div className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-full border border-border">
                  <Clock className="w-4 h-4" /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </div>
              </div>
            </div>

            <div className="shrink-0 w-full md:w-auto">
              {!isApplying ? (
                <button 
                  onClick={() => setIsApplying(true)}
                  className="w-full md:w-auto px-8 py-4 rounded-xl font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300"
                >
                  Apply Now
                </button>
              ) : (
                <button 
                  onClick={() => setIsApplying(false)}
                  className="w-full md:w-auto px-8 py-4 rounded-xl font-bold bg-secondary text-foreground hover:bg-secondary/80 transition-all duration-300"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Apply Inline Form */}
        {isApplying && (
          <div className="p-8 border-b border-border bg-background/50">
            <h3 className="text-xl font-bold mb-4">Submit Application</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Cover Letter (Optional)</label>
                <textarea 
                  value={coverLetter}
                  onChange={e => setCoverLetter(e.target.value)}
                  className="w-full h-32 px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                  placeholder="Why are you a great fit for this role?"
                />
              </div>
              <div className="flex justify-end">
                <button 
                  onClick={handleApply}
                  disabled={createApplication.isPending}
                  className="px-6 py-3 rounded-xl font-bold bg-green-600 text-white shadow-lg hover:bg-green-500 disabled:opacity-50 transition-all"
                >
                  {createApplication.isPending ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-8 md:p-10 space-y-10">
          
          <section>
            <h2 className="text-2xl font-display font-bold mb-4">About the Role</h2>
            <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          {job.techStack && job.techStack.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold mb-4">Tech Stack</h2>
              <div className="flex flex-wrap gap-2">
                {job.techStack.map(tech => (
                  <span key={tech} className="px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium">
                    {tech}
                  </span>
                ))}
              </div>
            </section>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold mb-4">Requirements</h2>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {job.responsibilities && job.responsibilities.length > 0 && (
            <section>
              <h2 className="text-2xl font-display font-bold mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
