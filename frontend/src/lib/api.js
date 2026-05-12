import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const createProject = (title) => api.post("/projects", { title }).then((r) => r.data);
export const getProject = (id) => api.get(`/projects/${id}`).then((r) => r.data);
export const listProjects = () => api.get(`/projects`).then((r) => r.data);
export const uploadVideo = (id, file, onProgress) => {
  const fd = new FormData();
  fd.append("file", file);
  return api.post(`/projects/${id}/upload`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total));
    },
  }).then((r) => r.data);
};
export const transcribe = (id) => api.post(`/projects/${id}/transcribe`).then((r) => r.data);
export const getTranscript = (id) => api.get(`/projects/${id}/transcript`).then((r) => r.data);
export const getMessages = (id) => api.get(`/projects/${id}/messages`).then((r) => r.data);
export const sendChat = (id, message) => api.post(`/projects/${id}/chat`, { message }).then((r) => r.data);
export const getEditPlan = (id) => api.get(`/projects/${id}/edit_plan`).then((r) => r.data);
export const renderProject = (id) => api.post(`/projects/${id}/render`).then((r) => r.data);
export const videoUrl = (id) => `${API}/projects/${id}/video`;
export const outputUrl = (id) => `${API}/projects/${id}/output`;
