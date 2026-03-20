import { useState } from "react";
import { useCreateJob } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { JobInput } from "@workspace/api-client-react";

export default function PostJob() {
  const createJob = useCreateJob();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [formData, setFormData] = useState<JobInput>({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "fulltime",
    experienceLevel: "mid",
    techStack: [],
    minPay: undefined,
    maxPay: undefined,
    status: "active"
  });

  const [techInput, setTechInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createJob.mutateAsync({ data: formData });
      toast({ title: "Job posted successfully!" });
      setLocation("/recruiter");
    } catch (err: any) {
      toast({ title: "Failed to post job", description: err.message, variant: "destructive" });
    }
  };

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && techInput.trim()) {
      e.preventDefault();
      if (!formData.techStack.includes(techInput.trim())) {
        setFormData(prev => ({ ...prev, techStack: [...prev.techStack, techInput.trim()] }));
      }
      setTechInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      <div className="bg-card border border-border p-8 md:p-10 rounded-3xl shadow-2xl">
        <h1 className="text-3xl font-display font-bold mb-2">Create Job Posting</h1>
        <p className="text-muted-foreground mb-8">Reach thousands of talented engineers.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Job Title</label>
              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none" placeholder="e.g. Senior Frontend Engineer" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Company Name</label>
              <input required value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none" placeholder="Acme Corp" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Job Description</label>
            <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full h-40 px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none resize-none" placeholder="Detail the role, team, and expectations..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none" placeholder="San Francisco, CA" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Employment Type</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value as any})} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none">
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Level</label>
              <select value={formData.experienceLevel} onChange={e => setFormData({...formData, experienceLevel: e.target.value as any})} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none">
                <option value="fresher">Fresher</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid-Level</option>
                <option value="senior">Senior</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tech Stack</label>
            <input type="text" value={techInput} onChange={e => setTechInput(e.target.value)} onKeyDown={handleAddTech} className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none mb-3" placeholder="Press Enter to add tag" />
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map(t => (
                <span key={t} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-md text-sm font-medium">
                  {t}
                </span>
              ))}
            </div>
          </div>

          <button type="submit" disabled={createJob.isPending} className="w-full px-6 py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50">
            {createJob.isPending ? "Posting..." : "Publish Job"}
          </button>
        </form>
      </div>
    </div>
  );
}
