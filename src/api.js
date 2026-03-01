import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

// Auth token management
let token = localStorage.getItem('u2c_token') || '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 60000,
});

api.interceptors.request.use(async (config) => {
  // Auto-login if no token
  if (!token) {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        username: 'admin',
        password: 'admin123',
      });
      token = res.data.token;
      localStorage.setItem('u2c_token', token);
    } catch (e) {
      console.warn('Auto-login failed:', e);
    }
  }
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export async function login(username, password) {
  const res = await api.post('/auth/login', { username, password });
  token = res.data.token;
  localStorage.setItem('u2c_token', token);
  return res.data;
}

// Unity2Cocos
export async function parseProject(projectPath) {
  const res = await api.post('/unity2cocos/parse', { projectPath });
  return res.data;
}

export async function listTasks() {
  const res = await api.get('/unity2cocos/tasks');
  return res.data.tasks;
}

export async function getTask(taskId) {
  const res = await api.get(`/unity2cocos/tasks/${taskId}`);
  return res.data;
}

export async function deleteTask(taskId) {
  await api.delete(`/unity2cocos/tasks/${taskId}`);
}

// Convert
export async function convertProject(projectPath, outputPath) {
  const res = await api.post('/unity2cocos/convert', { projectPath, outputPath });
  return res.data;
}

// AI Config
export async function setAIConfig(config) {
  const res = await api.post('/unity2cocos/ai-config', config);
  return res.data;
}

// AI Script Conversion
export async function convertScriptsAI(taskId, outputPath) {
  const res = await api.post('/unity2cocos/convert-scripts-ai', { taskId, outputPath }, { timeout: 600000 });
  return res.data;
}

export default api;
