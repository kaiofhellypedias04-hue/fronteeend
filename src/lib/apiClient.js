export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_BASE_URL || ''
);

let forbiddenHandler = null;

export function setApiForbiddenHandler(handler) {
  forbiddenHandler = typeof handler === 'function' ? handler : null;
}

export function normalizeBaseUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  if (raw.startsWith('/')) return raw.replace(/\/+$/, '') || '';
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return raw.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

export function normalizeApiPath(path) {
  const raw = String(path || '').trim();
  if (!raw) return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function buildApiUrl(path) {
  const endpoint = normalizeApiPath(path);
  if (!API_BASE_URL) return endpoint;
  return `${API_BASE_URL}${endpoint}`;
}

export class ApiClientError extends Error {
  constructor(message, { status = 0, data = null } = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
  }
}

function parseErrorMessage(status, data, fallback) {
  if (typeof data === 'string' && data.trim()) return data;
  if (data?.detail) return Array.isArray(data.detail) ? data.detail.map(item => item.msg || item.message || String(item)).join('; ') : String(data.detail);
  if (data?.message) return String(data.message);
  if (data?.error) return String(data.error);
  if (status === 401) return 'Nao autorizado pela API.';
  if (status === 403) return 'Sem permissao para executar esta acao.';
  return fallback || `Erro HTTP ${status}`;
}

async function parseResponse(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

export async function apiFetch(path, opts = {}) {
  const headers = new Headers(opts.headers || {});

  const req = { ...opts, headers };
  const timeoutMs = Number.isFinite(Number(opts.timeoutMs)) ? Number(opts.timeoutMs) : 15000;
  delete req.timeoutMs;

  let timeoutId = null;
  let abortListener = null;
  let controller = null;
  if (timeoutMs > 0) {
    controller = new AbortController();
    req.signal = controller.signal;
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    if (opts.signal) {
      if (opts.signal.aborted) controller.abort();
      abortListener = () => controller.abort();
      opts.signal.addEventListener('abort', abortListener, { once: true });
    }
  }

  try {
    const res = await fetch(buildApiUrl(path), req);
    if (res.status === 403) {
      forbiddenHandler?.();
    }
    return res;
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new ApiClientError('Tempo limite ao conectar com a API.', { status: 0 });
    }
    throw error;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
    if (opts.signal && abortListener) opts.signal.removeEventListener('abort', abortListener);
  }
}

export async function apiRequest(path, opts = {}) {
  const res = await apiFetch(path, opts);
  const data = await parseResponse(res);
  if (!res.ok) {
    throw new ApiClientError(parseErrorMessage(res.status, data), { status: res.status, data });
  }
  return data;
}

export async function apiFetchBlob(path, opts = {}) {
  const res = await apiFetch(path, opts);
  if (!res.ok) {
    const data = await parseResponse(res);
    throw new ApiClientError(parseErrorMessage(res.status, data), { status: res.status, data });
  }
  return res.blob();
}
