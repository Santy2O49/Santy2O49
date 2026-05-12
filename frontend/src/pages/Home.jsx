import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Sparkles, Scissors, MessageSquare, Type, Music2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { createProject, uploadVideo, listProjects } from "@/lib/api";

const FEATURES = [
  { icon: Scissors, title: "Smart trim & cuts", desc: "Tell the AI which seconds to drop. No timeline scrubbing." },
  { icon: MessageSquare, title: "Chat as edit", desc: "Iterate on your video by talking to it. Like a real editor." },
  { icon: Type, title: "Captions & overlays", desc: "Auto-generated captions, drop in text overlays in seconds." },
  { icon: Music2, title: "9:16 vertical export", desc: "One prompt to convert horizontal footage into shorts." },
];

export default function Home() {
  const navigate = useNavigate();
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [projects, setProjects] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    listProjects().then(setProjects).catch(() => {});
  }, []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please upload a video file.");
      return;
    }
    setBusy(true);
    setProgress(0);
    try {
      const project = await createProject(file.name.replace(/\.[^.]+$/, ""));
      await uploadVideo(project.id, file, setProgress);
      toast.success("Upload complete. Opening editor…");
      navigate(`/editor/${project.id}`);
    } catch (e) {
      toast.error("Upload failed. Try a smaller file.");
      console.error(e);
    } finally {
      setBusy(false);
    }
  }, [navigate]);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  };

  return (
    <div className="min-h-screen bg-obsidian text-white relative" data-testid="home-page">
      <div className="absolute inset-0 grid-bg pointer-events-none opacity-60" />

      {/* Top bar */}
      <header className="relative z-10 border-b border-line">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-warningYellow flex items-center justify-center">
              <Scissors size={14} className="text-black" strokeWidth={3} />
            </div>
            <div className="font-heading font-semibold tracking-tight text-lg">PromptCut</div>
            <span className="uppercase-label ml-3 hidden sm:inline">v0.1 · MVP</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#features" className="uppercase-label hover:text-white transition-colors">Features</a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="uppercase-label hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 border border-line bg-surface/60 mb-6">
              <Sparkles size={12} className="text-warningYellow" />
              <span className="uppercase-label text-warningYellow">AI-first video editor</span>
            </div>
            <h1 className="font-heading font-semibold tracking-tight text-5xl sm:text-6xl lg:text-[5.25rem] leading-[0.95]">
              Edit videos by<br />
              <span className="text-warningYellow">talking to them.</span>
            </h1>
            <p className="mt-6 text-zinc-400 text-base max-w-xl leading-relaxed">
              Drop a clip. Say <span className="mono text-zinc-200">"trim the first 8 seconds, add captions, make it vertical."</span>
              PromptCut writes the edit plan, you press export.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <button
                data-testid="hero-upload-button"
                onClick={() => inputRef.current?.click()}
                disabled={busy}
                className="group inline-flex items-center gap-2 bg-warningYellow text-black px-5 h-11 font-medium hover:brightness-95 transition disabled:opacity-50"
              >
                {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                {busy ? `Uploading ${progress}%` : "Upload a video"}
                <ArrowRight size={16} className="group-hover:translate-x-0.5 transition" />
              </button>
              <span className="uppercase-label">or drop the file anywhere below</span>
            </div>
          </div>

          {/* Drop zone */}
          <div className="lg:col-span-5">
            <div
              data-testid="drop-zone"
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`group cursor-pointer relative border ${dragOver ? "border-warningYellow" : "border-line"} bg-surface/40 backdrop-blur-sm h-[340px] flex flex-col items-center justify-center transition-colors`}
            >
              <div className="absolute top-3 left-3 uppercase-label">DROP ZONE</div>
              <div className="absolute top-3 right-3 mono text-xs text-zinc-500">.mp4 .mov .webm</div>
              <div className={`w-14 h-14 border border-line flex items-center justify-center mb-4 ${dragOver ? "bg-warningYellow text-black border-warningYellow" : "text-zinc-300"}`}>
                <Upload size={22} />
              </div>
              <div className="font-heading text-xl tracking-tight">
                {busy ? `Uploading ${progress}%` : "Drop your video here"}
              </div>
              <div className="text-zinc-500 text-sm mt-1">or click to choose a file</div>
              {busy && (
                <div className="mt-5 w-2/3 h-[2px] bg-line overflow-hidden">
                  <div className="h-full bg-warningYellow transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="hidden"
                data-testid="file-input"
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mt-24">
          <div className="uppercase-label mb-4">What it does</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-obsidian p-5 hover:bg-surface transition-colors">
                <Icon size={20} className="text-warningYellow" />
                <div className="mt-4 font-heading text-lg tracking-tight">{title}</div>
                <div className="text-zinc-500 text-sm mt-1.5 leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent projects */}
        {projects.length > 0 && (
          <section className="mt-20">
            <div className="uppercase-label mb-3">Recent projects</div>
            <div className="border border-line divide-y divide-line">
              {projects.slice(0, 6).map((p) => (
                <button
                  key={p.id}
                  data-testid={`recent-project-${p.id}`}
                  onClick={() => navigate(`/editor/${p.id}`)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-surface transition-colors text-left"
                >
                  <div>
                    <div className="font-heading text-base">{p.title}</div>
                    <div className="mono text-xs text-zinc-500 mt-0.5">{p.id.slice(0, 8)} · {new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  <ArrowRight size={16} className="text-zinc-500" />
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="relative z-10 border-t border-line">
        <div className="max-w-7xl mx-auto px-6 h-12 flex items-center justify-between text-xs text-zinc-500">
          <span>© PromptCut · An AI-first editor.</span>
          <span className="mono">claude-sonnet-4.5 · whisper-1 · ffmpeg</span>
        </div>
      </footer>
    </div>
  );
}
