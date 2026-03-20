import { useState } from "react";
import { useListJobs } from "@workspace/api-client-react";
import { Link } from "wouter";
import { MapPin, DollarSign, Clock, Search, Briefcase, Filter } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function JobsFeed() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search slightly
  useState(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(handler);
  });

  const { data, isLoading, error } = useListJobs({
    search: debouncedSearch || undefined,
    type: type as any || undefined,
    experienceLevel: experience as any || undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 w-full">
      {/* Filters Sidebar */}
      <aside className="w-full md:w-64 shrink-0 space-y-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-lg shadow-black/5 sticky top-24">
          <div className="flex items-center gap-2 mb-6 text-foreground font-display font-semibold">
            <Filter className="w-5 h-5" />
            Filters
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <input 
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Job title, tech..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Job Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
              >
                <option value="">All Types</option>
                <option value="internship">Internship</option>
                <option value="fulltime">Full-time</option>
                <option value="parttime">Part-time</option>
                <option value="contract">Contract</option>
                <option value="remote">Remote Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Experience Level</label>
              <select 
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-background border border-border focus:border-primary outline-none text-sm"
              >
                <option value="">Any Level</option>
                <option value="fresher">Fresher / New Grad</option>
                <option value="junior">Junior (1-3 yrs)</option>
                <option value="mid">Mid-Level (3-5 yrs)</option>
                <option value="senior">Senior (5+ yrs)</option>
              </select>
            </div>
          </div>
        </div>
      </aside>

      {/* Feed */}
      <div className="flex-1">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold">Discover Opportunities</h1>
            <p className="text-muted-foreground mt-1">Find your next role in tech.</p>
          </div>
          <div className="text-sm text-muted-foreground bg-card px-4 py-2 rounded-full border border-border">
            {data?.total || 0} jobs found
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-2xl bg-card animate-pulse border border-border"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-2xl">
            Failed to load jobs.
          </div>
        ) : data?.jobs.length === 0 ? (
          <div className="bg-card border border-border p-12 rounded-2xl text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold">No jobs found</h3>
            <p className="text-muted-foreground mt-1">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.jobs.map((job) => (
              <Link key={job.id} href={`/jobs/${job.id}`}>
                <div className="bg-card border border-border p-6 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    
                    <div className="space-y-3 flex-1">
                      <div>
                        <div className="text-sm font-semibold text-primary mb-1">{job.company}</div>
                        <h2 className="text-xl font-bold group-hover:text-primary transition-colors">{job.title}</h2>
                      </div>
                      
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location} {job.isRemote && "(Remote)"}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </div>
                        {(job.minPay || job.maxPay) && (
                          <div className="flex items-center gap-1 text-green-500 font-medium">
                            <DollarSign className="w-4 h-4" />
                            ${job.minPay?.toLocaleString() || 0} - ${job.maxPay?.toLocaleString() || "Max"}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        {job.techStack.map(tech => (
                          <span key={tech} className="px-2.5 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-medium">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-row md:flex-col justify-between items-end shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </span>
                      <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg font-medium text-sm transition-colors mt-4 md:mt-0">
                        View Details
                      </button>
                    </div>

                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
