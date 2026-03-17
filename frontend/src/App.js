import { useState, useEffect, useRef } from "react";
import "@/App.css";
import axios from "axios";
import { 
  FolderOpen, File, ChevronRight, ChevronDown, Send, Trash2, 
  Plus, Settings, RefreshCw, Terminal, Search, Globe, HardDrive, 
  Cpu, MessageSquare, Code, Loader2, ArrowLeft
} from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const api = {
  getSettings: () => axios.get(`${API}/settings`),
  updateSettings: (data) => axios.put(`${API}/settings`, data),
  getOllamaStatus: () => axios.get(`${API}/ollama/status`),
  getOllamaModels: () => axios.get(`${API}/ollama/models`),
  getProjects: () => axios.get(`${API}/projects`),
  createProject: (data) => axios.post(`${API}/projects`, data),
  deleteProject: (id) => axios.delete(`${API}/projects/${id}`),
  listFiles: (path) => axios.get(`${API}/files/list`, { params: { path } }),
  readFile: (path) => axios.get(`${API}/files/read`, { params: { path } }),
  writeFile: (path, content) => axios.post(`${API}/files/write`, { path, content }),
  search: (query, path, fp) => axios.post(`${API}/search`, { query, path, file_pattern: fp }),
  execute: (command, cwd) => axios.post(`${API}/execute`, { command, cwd }),
  getChatHistory: (pid) => axios.get(`${API}/chat/${pid}`),
  sendMessage: (pid, msg, model) => axios.post(`${API}/chat`, { project_id: pid, message: msg, model }),
  clearChat: (pid) => axios.delete(`${API}/chat/${pid}`)
};

function App() {
  const [settings, setSettings] = useState(null);
  const [ollamaStatus, setOllamaStatus] = useState("disconnected");
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [commandInput, setCommandInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState({ chat: false, files: false, cmd: false, search: false });
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");
  
  const chatEndRef = useRef(null);
  const termEndRef = useRef(null);

  useEffect(() => {
    loadSettings();
    loadProjects();
    checkOllamaStatus();
    loadModels();
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatMessages]);
  useEffect(() => { termEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [terminalOutput]);

  const loadSettings = async () => {
    try {
      const res = await api.getSettings();
      setSettings(res.data);
      if (res.data.selected_model) setSelectedModel(res.data.selected_model);
    } catch (e) { console.error(e); }
  };

  const updateSettings = async (u) => {
    try { const res = await api.updateSettings(u); setSettings(res.data); } 
    catch (e) { console.error(e); }
  };

  const checkOllamaStatus = async () => {
    try { const res = await api.getOllamaStatus(); setOllamaStatus(res.data.status); } 
    catch (e) { setOllamaStatus("disconnected"); }
  };

  const loadModels = async () => {
    try {
      const res = await api.getOllamaModels();
      setModels(res.data.models);
      if (res.data.models.length > 0 && !selectedModel) setSelectedModel(res.data.models[0].name);
    } catch (e) { console.error(e); }
  };

  const loadProjects = async () => {
    try { const res = await api.getProjects(); setProjects(res.data); } 
    catch (e) { console.error(e); }
  };

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    try {
      const res = await api.createProject({ name: newProjectName, description: newProjectDesc });
      setProjects([...projects, res.data]);
      setShowNewProject(false);
      setNewProjectName("");
      setNewProjectDesc("");
      setCurrentProject(res.data);
      loadProjectFiles(res.data.path);
    } catch (e) { console.error(e); }
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    try {
      await api.deleteProject(id);
      setProjects(projects.filter(p => p.id !== id));
      if (currentProject?.id === id) { setCurrentProject(null); setFiles([]); setChatMessages([]); }
    } catch (e) { console.error(e); }
  };

  const selectProject = async (p) => {
    setCurrentProject(p);
    setSelectedFile(null);
    setFileContent("");
    loadProjectFiles(p.path);
    loadChatHistory(p.id);
  };

  const loadProjectFiles = async (path) => {
    setLoading(prev => ({ ...prev, files: true }));
    try { const res = await api.listFiles(path); setFiles(res.data.items); } 
    catch (e) { setFiles([]); }
    setLoading(prev => ({ ...prev, files: false }));
  };

  const selectFile = async (f) => {
    if (f.is_directory) {
      loadProjectFiles(f.path);
      return;
    }
    setSelectedFile(f);
    try {
      const res = await api.readFile(f.path);
      setFileContent(res.data.content);
      setOriginalContent(res.data.content);
    } catch (e) { setFileContent("Error loading file"); }
  };

  const saveFile = async () => {
    if (!selectedFile) return;
    try { await api.writeFile(selectedFile.path, fileContent); setOriginalContent(fileContent); } 
    catch (e) { console.error(e); }
  };

  const loadChatHistory = async (pid) => {
    try { const res = await api.getChatHistory(pid); setChatMessages(res.data.messages); } 
    catch (e) { setChatMessages([]); }
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || !currentProject || !selectedModel) return;
    const um = { id: Date.now().toString(), role: "user", content: chatInput, timestamp: new Date().toISOString() };
    setChatMessages(prev => [...prev, um]);
    setChatInput("");
    setLoading(prev => ({ ...prev, chat: true }));
    try {
      const res = await api.sendMessage(currentProject.id, chatInput, selectedModel);
      setChatMessages(prev => [...prev.slice(0, -1), res.data.user_message, res.data.assistant_message]);
    } catch (e) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: "assistant", content: "Error: Failed to get response.", timestamp: new Date().toISOString() }]);
    }
    setLoading(prev => ({ ...prev, chat: false }));
  };

  const execCmd = async () => {
    if (!commandInput.trim()) return;
    const o = [...terminalOutput, { type: "command", content: `$ ${commandInput}` }];
    setTerminalOutput(o);
    setLoading(prev => ({ ...prev, cmd: true }));
    try {
      const res = await api.execute(commandInput, currentProject?.path);
      setTerminalOutput([...o, { type: "stdout", content: res.data.stdout }, ...(res.data.stderr ? [{ type: "stderr", content: res.data.stderr }] : [])]);
    } catch (e) { setTerminalOutput([...o, { type: "stderr", content: `Error: ${e.message}` }]); }
    setCommandInput("");
    setLoading(prev => ({ ...prev, cmd: false }));
  };

  const doSearch = async () => {
    if (!searchQuery.trim() || !currentProject) return;
    setLoading(prev => ({ ...prev, search: true }));
    try { const res = await api.search(searchQuery, currentProject.path, "*"); setSearchResults(res.data.results); } 
    catch (e) { console.error(e); }
    setLoading(prev => ({ ...prev, search: false }));
  };

  const hasChanges = fileContent !== originalContent;

  const formatMsg = (c) => {
    const parts = c.split(/(```[\s\S]*?```)/g);
    return parts.map((p, i) => {
      if (p.startsWith('```')) {
        const code = p.replace(/```\w*\n?/, '').replace(/```$/, '');
        return <pre key={i} className="code-block my-2"><code>{code}</code></pre>;
      }
      return <span key={i}>{p}</span>;
    });
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-[#09090b] p-6">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[4px] bg-blue-500/20 flex items-center justify-center">
              <Code size={20} className="text-blue-400" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-xl text-zinc-100">Local Code Agent</h1>
              <p className="text-xs text-zinc-500">AI-Powered Development Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 rounded-[4px] border border-zinc-800">
              <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} style={{ boxShadow: ollamaStatus === 'connected' ? '0 0 8px rgba(34,197,94,0.5)' : '0 0 8px rgba(239,68,68,0.5)' }} />
              <span className="text-xs text-zinc-400">Ollama</span>
              <button data-testid="refresh-ollama" onClick={() => { checkOllamaStatus(); loadModels(); }} className="p-1 hover:bg-zinc-800 rounded">
                <RefreshCw size={12} className="text-zinc-400" />
              </button>
            </div>
            
            <select data-testid="model-selector" value={selectedModel} onChange={(e) => { setSelectedModel(e.target.value); updateSettings({ selected_model: e.target.value }); }} className="bg-zinc-900 border border-zinc-800 rounded-[4px] px-3 py-1.5 text-sm text-zinc-100 outline-none">
              {models.length === 0 && <option value="">No models</option>}
              {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
            
            <button data-testid="settings-btn" onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-zinc-800 rounded text-zinc-400">
              <Settings size={18} />
            </button>
          </div>
        </header>

        {showSettings && settings && (
          <div className="bg-[#121212] border border-zinc-800 rounded-[4px] p-4 mb-6">
            <h2 className="font-mono font-medium text-zinc-100 mb-4">Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Ollama URL</label>
                <input data-testid="ollama-url-input" type="text" value={settings.ollama_url} onChange={(e) => updateSettings({ ollama_url: e.target.value })} className="bg-zinc-800/30 border border-zinc-700 rounded-[2px] px-3 h-9 text-sm w-full outline-none text-zinc-100" />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Projects Path</label>
                <input data-testid="projects-path-input" type="text" value={settings.projects_path} onChange={(e) => updateSettings({ projects_path: e.target.value })} className="bg-zinc-800/30 border border-zinc-700 rounded-[2px] px-3 h-9 text-sm w-full outline-none text-zinc-100" />
              </div>
              <div className="col-span-full flex gap-8">
                <div className="flex items-center gap-3">
                  <button data-testid="toggle-file-system-access" onClick={() => updateSettings({ file_access_enabled: !settings.file_access_enabled })} className={`w-9 h-5 rounded-full relative ${settings.file_access_enabled ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${settings.file_access_enabled ? 'left-5' : 'left-1'}`} />
                  </button>
                  <span className="text-sm text-zinc-400">File System Access</span>
                </div>
                <div className="flex items-center gap-3">
                  <button data-testid="toggle-internet-access" onClick={() => updateSettings({ internet_access_enabled: !settings.internet_access_enabled })} className={`w-9 h-5 rounded-full relative ${settings.internet_access_enabled ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                    <span className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-transform ${settings.internet_access_enabled ? 'left-5' : 'left-1'}`} />
                  </button>
                  <span className="text-sm text-zinc-400">Internet Access</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-mono font-medium text-zinc-400 text-sm uppercase tracking-wider">Projects</h2>
          <button data-testid="new-project-btn" onClick={() => setShowNewProject(true)} className="bg-zinc-800/50 text-zinc-100 hover:bg-zinc-700/50 h-9 px-4 rounded-sm font-medium text-sm border border-zinc-700 flex items-center gap-2">
            <Plus size={14} /> New Project
          </button>
        </div>

        {showNewProject && (
          <div className="bg-[#121212] border border-zinc-800 rounded-[4px] p-4 mb-6">
            <h3 className="font-mono font-medium text-zinc-100 mb-4">Create New Project</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Project Name</label>
                <input data-testid="new-project-name" type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} className="bg-zinc-800/30 border border-zinc-700 rounded-[2px] px-3 h-9 text-sm w-full outline-none text-zinc-100" placeholder="my-project" autoFocus />
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">Description</label>
                <input data-testid="new-project-desc" type="text" value={newProjectDesc} onChange={(e) => setNewProjectDesc(e.target.value)} className="bg-zinc-800/30 border border-zinc-700 rounded-[2px] px-3 h-9 text-sm w-full outline-none text-zinc-100" placeholder="Description" />
              </div>
              <div className="flex gap-3">
                <button data-testid="create-project-btn" onClick={createProject} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 px-4 rounded-sm font-medium text-sm">Create Project</button>
                <button onClick={() => setShowNewProject(false)} className="bg-zinc-800/50 text-zinc-100 hover:bg-zinc-700/50 h-9 px-4 rounded-sm font-medium text-sm border border-zinc-700">Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} data-testid={`project-card-${p.id}`} className="bg-[#121212] border border-zinc-800 rounded-[4px] p-4 cursor-pointer hover:border-blue-500/50 group" onClick={() => selectProject(p)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen size={18} className="text-yellow-500" />
                  <h3 className="font-mono font-medium text-zinc-100">{p.name}</h3>
                </div>
                <button data-testid={`delete-project-${p.id}`} onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className="text-sm text-zinc-500 mb-3">{p.description || "No description"}</p>
              <div className="text-xs text-zinc-600 font-mono truncate">{p.path}</div>
            </div>
          ))}
          {projects.length === 0 && !showNewProject && (
            <div className="col-span-full text-center py-16">
              <FolderOpen size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 mb-4">No projects yet</p>
              <button data-testid="create-first-project-btn" onClick={() => setShowNewProject(true)} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 px-4 rounded-sm font-medium text-sm">Create your first project</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#09090b] overflow-hidden">
      <header className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button data-testid="back-to-projects" onClick={() => setCurrentProject(null)} className="p-2 hover:bg-zinc-800 rounded text-zinc-400">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-2">
            <FolderOpen size={16} className="text-yellow-500" />
            <span className="font-mono font-medium text-zinc-100">{currentProject.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900 rounded-[4px] border border-zinc-800">
            <div className={`w-2 h-2 rounded-full ${ollamaStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-zinc-400">Ollama</span>
          </div>
          
          <select data-testid="workspace-model-selector" value={selectedModel} onChange={(e) => { setSelectedModel(e.target.value); updateSettings({ selected_model: e.target.value }); }} className="bg-zinc-900 border border-zinc-800 rounded-[4px] px-3 py-1 text-sm text-zinc-100 outline-none">
            {models.map(m => <option key={m.name} value={m.name}>{m.name}</option>)}
          </select>
          
          {settings && (
            <div className="flex items-center gap-4 px-3 py-1 bg-zinc-900 rounded-[4px] border border-zinc-800">
              <div className="flex items-center gap-2">
                <HardDrive size={12} className={settings.file_access_enabled ? 'text-green-400' : 'text-zinc-600'} />
                <button data-testid="toggle-file-access-workspace" onClick={() => updateSettings({ file_access_enabled: !settings.file_access_enabled })} className={`w-8 h-4 rounded-full relative ${settings.file_access_enabled ? 'bg-green-500' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white ${settings.file_access_enabled ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={12} className={settings.internet_access_enabled ? 'text-blue-400' : 'text-zinc-600'} />
                <button data-testid="toggle-internet-access-workspace" onClick={() => updateSettings({ internet_access_enabled: !settings.internet_access_enabled })} className={`w-8 h-4 rounded-full relative ${settings.internet_access_enabled ? 'bg-blue-500' : 'bg-zinc-700'}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white ${settings.internet_access_enabled ? 'left-4' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-zinc-800 flex flex-col bg-[#0c0c0c]">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-[#09090b]/50">
            <span className="text-xs uppercase tracking-widest text-zinc-500 font-medium">Files</span>
            <button data-testid="refresh-files" onClick={() => loadProjectFiles(currentProject.path)} className="p-1 hover:bg-zinc-800 rounded text-zinc-500">
              <RefreshCw size={12} />
            </button>
          </div>
          <div className="flex-1 overflow-auto p-2">
            {loading.files ? (
              <div className="flex items-center justify-center py-8"><Loader2 className="animate-spin text-zinc-500" /></div>
            ) : (
              files.map(f => (
                <div key={f.path} data-testid={`file-item-${f.name}`} className={`flex items-center gap-2 px-2 py-1.5 hover:bg-zinc-800/50 cursor-pointer rounded-sm text-sm ${selectedFile?.path === f.path ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-300'}`} onClick={() => selectFile(f)}>
                  {f.is_directory ? (
                    <>
                      <ChevronRight size={14} className="text-zinc-500" />
                      <FolderOpen size={14} className="text-yellow-500" />
                    </>
                  ) : (
                    <>
                      <span className="w-[14px]" />
                      <File size={14} className="text-blue-400" />
                    </>
                  )}
                  <span className="truncate flex-1">{f.name}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex border-b border-zinc-800 bg-[#0a0a0a]">
            {[{ id: "chat", icon: MessageSquare, label: "Chat" }, { id: "editor", icon: Code, label: "Editor" }, { id: "terminal", icon: Terminal, label: "Terminal" }, { id: "search", icon: Search, label: "Search" }].map(t => (
              <button key={t.id} data-testid={`tab-${t.id}`} onClick={() => setActiveTab(t.id)} className={`px-4 py-2 text-sm font-medium flex items-center gap-2 border-b-2 ${activeTab === t.id ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>
                <t.icon size={14} />
                {t.label}
                {t.id === 'editor' && hasChanges && <span className="w-2 h-2 rounded-full bg-yellow-500" />}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto p-4 space-y-4">
                  {chatMessages.length === 0 && (
                    <div className="text-center py-16">
                      <Cpu size={48} className="text-zinc-700 mx-auto mb-4" />
                      <p className="text-zinc-500 mb-2">Start a conversation</p>
                      <p className="text-xs text-zinc-600">Model: <span className="text-blue-400">{selectedModel || "None"}</span></p>
                    </div>
                  )}
                  {chatMessages.map(m => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-[4px] px-4 py-3 ${m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-100'}`}>
                        <div className="whitespace-pre-wrap">{formatMsg(m.content)}</div>
                      </div>
                    </div>
                  ))}
                  {loading.chat && <div className="flex justify-start"><div className="bg-zinc-800 rounded-[4px] px-4 py-3 flex items-center gap-2"><Loader2 size={14} className="animate-spin" /><span className="text-zinc-400">Thinking...</span></div></div>}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t border-zinc-800 bg-[#0a0a0a]">
                  <div className="flex gap-2">
                    <input data-testid="chat-input" type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder="Ask anything..." className="flex-1 bg-zinc-800/30 border border-zinc-700 rounded-[2px] px-3 h-9 text-sm outline-none text-zinc-100" disabled={loading.chat} />
                    <button data-testid="send-message" onClick={sendMessage} disabled={loading.chat || !chatInput.trim()} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 px-4 rounded-sm font-medium text-sm flex items-center gap-2"><Send size={14} /></button>
                    <button data-testid="clear-chat" onClick={() => { api.clearChat(currentProject.id); setChatMessages([]); }} className="p-2 hover:bg-zinc-800 rounded text-zinc-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "editor" && (
              <div className="h-full flex flex-col">
                {selectedFile ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-[#0a0a0a]">
                      <div className="flex items-center gap-2">
                        <File size={14} className="text-blue-400" />
                        <span className="text-sm text-zinc-300 font-mono">{selectedFile.name}</span>
                        {hasChanges && <span className="text-xs text-yellow-500">(unsaved)</span>}
                      </div>
                      <button data-testid="save-file" onClick={saveFile} disabled={!hasChanges} className={`bg-zinc-100 text-zinc-900 h-7 px-3 rounded-sm text-xs ${!hasChanges ? 'opacity-50' : 'hover:bg-zinc-200'}`}>Save</button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <textarea data-testid="code-editor" value={fileContent} onChange={(e) => setFileContent(e.target.value)} className="w-full h-full bg-[#09090b] text-zinc-100 font-mono text-sm p-4 resize-none outline-none" spellCheck={false} />
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center"><div className="text-center"><File size={48} className="text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500">Select a file to edit</p></div></div>
                )}
              </div>
            )}

            {activeTab === "terminal" && (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-auto p-4 bg-[#09090b]">
                  {terminalOutput.map((l, i) => (
                    <div key={i} className={`font-mono text-sm whitespace-pre-wrap ${l.type === "command" ? "text-blue-400" : l.type === "stderr" ? "text-red-400" : "text-green-400"}`}>{l.content}</div>
                  ))}
                  <div ref={termEndRef} />
                </div>
                <div className="p-4 border-t border-zinc-800 bg-[#0a0a0a]">
                  <div className="flex gap-2 items-center">
                    <span className="text-blue-400 font-mono">$</span>
                    <input data-testid="terminal-input" type="text" value={commandInput} onChange={(e) => setCommandInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && execCmd()} placeholder="Enter command..." className="flex-1 bg-transparent outline-none font-mono text-sm text-zinc-100" disabled={loading.cmd} />
                    {loading.cmd && <Loader2 size={14} className="animate-spin text-zinc-500" />}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "search" && (
              <div className="h-full flex flex-col">
                <div className="p-4 border-b border-zinc-800 bg-[#0a0a0a]">
                  <div className="flex gap-2">
                    <input data-testid="search-input" type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && doSearch()} placeholder="Search in project..." className="flex-1 bg-zinc-800/30 border border-zinc-700 rounded-[2px] px-3 h-9 text-sm outline-none text-zinc-100" />
                    <button data-testid="search-btn" onClick={doSearch} disabled={loading.search} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 h-9 px-4 rounded-sm font-medium text-sm flex items-center gap-2">{loading.search ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}</button>
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-4">
                  {searchResults.length === 0 ? (
                    <div className="text-center py-16"><Search size={48} className="text-zinc-700 mx-auto mb-4" /><p className="text-zinc-500">Search for text</p></div>
                  ) : (
                    <div className="space-y-2">
                      {searchResults.map((r, i) => (
                        <div key={i} className="bg-[#121212] border border-zinc-800 rounded-[4px] p-3 cursor-pointer hover:border-blue-500/50" onClick={() => { selectFile({ path: r.path, name: r.path.split(/[/\\]/).pop(), is_directory: false }); setActiveTab("editor"); }}>
                          <div className="flex items-center gap-2 mb-1">
                            <File size={12} className="text-blue-400" />
                            <span className="text-xs text-zinc-400 font-mono truncate">{r.path}</span>
                            {r.line && <span className="text-xs text-zinc-600">Line {r.line}</span>}
                          </div>
                          <p className="text-sm text-zinc-300 font-mono truncate">{r.match}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
