import { useState } from "react";
import { useGenerateResume } from "@workspace/api-client-react";
import type { ResumeGenerateRequestTemplateId } from "@workspace/api-client-react";
import { FileText, Download, Loader2 } from "lucide-react";

export default function ResumeBuilder() {
  const [templateId, setTemplateId] = useState<ResumeGenerateRequestTemplateId>("modern");
  const generateResume = useGenerateResume();
  const [resumeHtml, setResumeHtml] = useState<string | null>(null);

  const handleGenerate = async () => {
    try {
      const res = await generateResume.mutateAsync({
        data: { templateId, includePhoto: false }
      });
      setResumeHtml(res.html);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePrint = () => {
    if (!resumeHtml) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Resume</title></head>
          <body>${resumeHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
      
      {/* Sidebar Controls */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            ATS Builder
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Generate a perfectly formatted, ATS-friendly resume from your profile data.
          </p>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Template</label>
              <select 
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary outline-none"
              >
                <option value="modern">Modern Professional</option>
                <option value="classic">Classic ATS</option>
                <option value="minimal">Minimalist</option>
                <option value="bold">Bold Tech</option>
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generateResume.isPending}
              className="w-full px-4 py-3 rounded-xl font-bold bg-primary text-white shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {generateResume.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Generate Preview"}
            </button>

            {resumeHtml && (
              <button
                onClick={handlePrint}
                className="w-full px-4 py-3 rounded-xl font-bold bg-secondary text-foreground hover:bg-secondary/80 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" /> Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Pane */}
      <div className="lg:col-span-3">
        <div className="bg-white text-black min-h-[800px] rounded-xl shadow-2xl p-8 border border-white/20">
          {!resumeHtml ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p>Click Generate to preview your resume</p>
            </div>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: resumeHtml }} />
          )}
        </div>
      </div>

    </div>
  );
}
