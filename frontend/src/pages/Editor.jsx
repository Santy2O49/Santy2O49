import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Scissors, Download, Loader2, ArrowLeft, FileText } from "lucide-react";
import {
  getProject, getTranscript, getMessages, getEditPlan,
  transcribe, sendChat, renderProject, videoUrl, outputUrl,
} from "@/lib/api";
import MediaPanel from "@/components/editor/MediaPanel";
import VideoPlayer from "@/components/editor/VideoPlayer";
import ChatPanel from "@/components/editor/ChatPanel";
import Timeline from "@/components/editor/Timeline";

export default function Editor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [project, setProject] = useState(null);
  const [transcript, setTranscript] = useState({ text: "", segments: [] });
  const [messages, setMessages] = useState([]);
  const [editPlan, setEditPlan] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const [chatting, setChatting] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [hasOutput, setHasOutput] = useState(false);

  const refresh = useCallback(async () => {
    const [p, t, m, ep] = await Promise.all([
      getProject(projectId),
      getTranscript(projectId),
      getMessages(projectId),
      getEditPlan(projectId),
    ]);
    setProject(p);
    setTranscript(t);
    setMessages(m);
    setEditPlan(ep);
    setHasOutput(p.render_status === "done");
    return p;
  }, [projectId]);

  useEffect(() => {
    refresh().catch(() => toast.error("Failed to load project."));
  }, [refresh]);

  // auto-trigger transcription when video uploaded and not yet transcribed
  useEffect(() => {
    if (!project) return;
    if (project.has_video && project.transcript_status === "pending" && !transcribing) {
      runTranscription();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project]);

  const runTranscription = async () => {
    setTranscribing(true);
    try {
      const res = await transcribe(projectId);
      setTranscript({ text: res.text, segments: res.segments });
      toast.success("Transcript ready.");
      await refresh();
    } catch (e) {
      toast.error("Transcription failed.");
      console.error(e);
    } finally {
      setTranscribing(false);
    }
  };

  const onSendMessage = async (text) => {
    if (!text.trim() || chatting) return;
    const userMsg = { id: `tmp-${Date.now()}`, role: "user", content: text, created_at: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    setChatting(true);
    try {
      const res = await sendChat(projectId, text);
      setMessages((m) => [...m.filter((x) => x.id !== userMsg.id), res.user, res.assistant]);
      setEditPlan(res.edit_plan);
    } catch (e) {
      toast.error("AI editor failed.");
      console.error(e);
      setMessages((m) => m.filter((x) => x.id !== userMsg.id));
    } finally {
      setChatting(false);
    }
  };

  const onRender = async () => {
    setRendering(true);
    try {
      await renderProject(projectId);
      toast.success("Export ready.");
      setHasOutput(true);
      await refresh();
    } catch (e) {
      toast.error("Render failed.");
      console.error(e);
    } finally {
      setRendering(false);
    }
  };

  const onSeek = (t) => {
    if (videoRef.current) {
      videoRef.current.currentTime = t;
      videoRef.current.play();
    }
  };

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-obsidian text-zinc-500">
        <Loader2 className="animate-spin mr-2" size={16} />
        <span className="uppercase-label">Loading editor…</span>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-obsidian text-white overflow-hidden" data-testid="editor-page">
      {/* Top bar */}
      <header className="h-12 border-b border-line flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <button
            data-testid="back-button"
            onClick={() => navigate("/")}
            className="text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <ArrowLeft size={16} />
            <span className="uppercase-label">Home</span>
          </button>
          <div className="w-px h-4 bg-line mx-2" />
          <div className="w-6 h-6 bg-warningYellow flex items-center justify-center">
            <Scissors size={11} className="text-black" strokeWidth={3} />
          </div>
          <span className="font-heading font-semibold tracking-tight" data-testid="project-title">{project.title}</span>
          <span className="mono text-xs text-zinc-500">/ {projectId.slice(0, 8)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="uppercase-label hidden md:inline mr-2">
            {project.transcript_status === "running" || transcribing ? <span className="shimmer-text">Transcribing…</span> :
             project.transcript_status === "done" ? <span className="text-zinc-400">Transcript ready</span> :
             <span className="text-zinc-500">Transcript pending</span>}
          </span>
          {hasOutput && (
            <a
              data-testid="download-output-button"
              href={outputUrl(projectId)}
              download
              className="inline-flex items-center gap-1.5 px-3 h-9 border border-line bg-surface text-zinc-200 hover:bg-surfaceHover transition-colors"
            >
              <FileText size={14} />
              <span className="text-sm">Download</span>
            </a>
          )}
          <button
            data-testid="export-button"
            onClick={onRender}
            disabled={rendering || !project.has_video}
            className="inline-flex items-center gap-1.5 px-4 h-9 bg-warningYellow text-black font-medium hover:brightness-95 transition disabled:opacity-50"
          >
            {rendering ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            {rendering ? "Rendering…" : "Export"}
          </button>
        </div>
      </header>

      {/* Workspace 3 columns */}
      <div className="flex-1 flex min-h-0">
        <MediaPanel
          transcript={transcript}
          transcribing={transcribing || project.transcript_status === "running"}
          currentTime={currentTime}
          onSeek={onSeek}
          onRetranscribe={runTranscription}
          project={project}
        />
        <VideoPlayer
          videoRef={videoRef}
          src={videoUrl(projectId)}
          outputSrc={hasOutput ? outputUrl(projectId) : null}
          onTime={setCurrentTime}
          onDuration={setDuration}
          editPlan={editPlan}
        />
        <ChatPanel
          messages={messages}
          editPlan={editPlan}
          onSend={onSendMessage}
          chatting={chatting}
          transcriptReady={project.transcript_status === "done"}
        />
      </div>

      {/* Timeline */}
      <Timeline
        duration={duration || project.duration}
        currentTime={currentTime}
        editPlan={editPlan}
        transcript={transcript}
        onSeek={onSeek}
      />
    </div>
  );
}
