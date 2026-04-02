/* ─────────────────────────────────────────────────────────────
   Portal de Auditoria Fiscal NFS-e
   ───────────────────────────────────────────────────────────── */
const { useState, useEffect, useMemo, useCallback, useRef } = React;

// ── Constantes ──────────────────────────────────────────────
const MENU = [
  { key: 'dashboard',    label: 'Dashboard',       section: 'visão geral',  icon: IconDashboard },
  { key: 'execucao',     label: 'Execução',         section: 'operações',    icon: IconPlay },
  { key: 'agendamentos', label: 'Agendamentos',     section: 'operações',    icon: IconClock },
  { key: 'fila_trabalho',label: 'Fila de Trabalho', section: 'operações',    icon: IconFolder },
  { key: 'fila_trabalho_b',label: 'Fila de Trabalho B', section: 'operações', icon: IconFolder },
  { key: 'processos',    label: 'Processos',        section: 'dados',        icon: IconProcess },
  { key: 'nfse',         label: 'NFS-e',            section: 'dados',        icon: IconDoc },
  { key: 'relatorio',    label: 'Relatório',        section: 'dados',        icon: IconChart },
  { key: 'certificados', label: 'Certificados',     section: 'configuração', icon: IconCert },
  { key: 'credenciais',  label: 'Credenciais',      section: 'configuração', icon: IconKey },
  { key: 'configuracoes',label: 'Configurações',    section: 'configuração', icon: IconSettings },
];

const API_URL_STORAGE_KEY = 'nfse_url';

const RAILWAY_API_BASE_URL = 'https://backend-render-ready-production.up.railway.app';
const DEFAULT_API_BASE_URL = normalizeBaseUrl(RAILWAY_API_BASE_URL);

const DEFAULT_API_URL = resolveDefaultApiUrl();

function readViteApiBaseUrl() {
  // Access import.meta only via Function so static builds (non-module script) do not fail parsing.
  try { return Function('return import.meta.env.VITE_API_BASE_URL || ""')(); }
  catch { return ''; }
}

function resolveDefaultApiUrl() {
  const viteUrl = normalizeBaseUrl(readViteApiBaseUrl());
  if (viteUrl) return viteUrl;
  return normalizeBaseUrl(window.__APP_CONFIG__?.API_BASE_URL || '');
}


function normalizeBaseUrl(url) {
  const raw = String(url || '').trim();
  if (!raw) return '';
  try {
    const u = new URL(raw);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
    return raw.replace(/\/+$/, '');
  } catch {
    return '';
  }
}

function isLocalhostUrl(url) {
  try {
    const u = new URL(url);
    const host = String(u.hostname || '').toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0' || host === '::1';
  } catch {
    return false;
  }
}

function isHttpUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function isAllowedApiBaseUrl(url) {
  const normalized = normalizeBaseUrl(url);
  return !!normalized && isHttpUrl(normalized) && !isLocalhostUrl(normalized);
}

function resolveApiBaseUrl() {
  const configured = normalizeBaseUrl(window.__NFSE_API_BASE_URL__ || '');
  if (isAllowedApiBaseUrl(configured)) return configured;

  const fallback = DEFAULT_API_URL;
  const stored = normalizeBaseUrl(localStorage.getItem(API_URL_STORAGE_KEY));
  if (!stored) return fallback;
  if (isLocalhostUrl(stored)) return fallback;
  return stored;
}

// ── Icons ────────────────────────────────────────────────────
function Ico({ d, size = 16, stroke = 'currentColor', fill = 'none' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

function IconDashboard() { return <Ico d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10" />; }
function IconPlay()      { return <Ico d="M5 3l14 9-14 9V3z" />; }
function IconClock()     { return <Ico d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 6v6l4 2" />; }
function IconProcess()   { return <Ico d={["M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2","M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"]} />; }
function IconDoc()       { return <Ico d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />; }
function IconChart()     { return <Ico d="M18 20V10 M12 20V4 M6 20v-6" />; }
function IconCert()      { return <Ico d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />; }
function IconKey()       { return <Ico d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />; }
function IconSettings()  { return <Ico d={["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"]} />; }
function IconPlus()      { return <Ico d="M12 5v14 M5 12h14" />; }
function IconEdit()      { return <Ico d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />; }
function IconTrash()     { return <Ico d={["M3 6h18","M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6","M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"]} />; }
function IconLock()      { return <Ico d={["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z","M17 11V7a5 5 0 00-10 0v4"]} />; }
function IconDown()      { return <Ico d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3" />; }
function IconRefresh()   { return <Ico d="M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15" />; }
function IconFilter()    { return <Ico d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />; }
function IconX()         { return <Ico d="M18 6L6 18 M6 6l12 12" />; }
function IconCheck()     { return <Ico d="M20 6L9 17l-5-5" />; }
function IconInfo()      { return <Ico d={["M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z","M12 16v-4","M12 8h.01"]} />; }
function IconStop()      { return <Ico d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />; }
function IconFolder()    { return <Ico d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />; }

// ── Utilitários ──────────────────────────────────────────────
function cn(...c) { return c.filter(Boolean).join(' '); }

function fmtMoney(v) {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function fmtDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleString('pt-BR');
}

function fmtDateShort(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return String(v);
  return d.toLocaleDateString('pt-BR');
}

function fmtCompetenciaFromDate(v) {
  if (!v) return '—';
  const d = new Date(v);
  if (isNaN(d)) return '—';
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
}

function toDateInputValue(value = new Date()) {
  const d = value instanceof Date ? new Date(value) : new Date(value);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function shiftDate(value, days) {
  const d = value instanceof Date ? new Date(value) : new Date(value);
  if (isNaN(d)) return new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function today() { return toDateInputValue(new Date()); }
function yesterday() { return toDateInputValue(shiftDate(new Date(), -1)); }

function clientName(alias) {
  if (!alias) return 'Cliente';
  if (alias.includes(' - ')) return alias.split(' - ').slice(1).join(' - ').trim();
  return alias;
}

function normFilterValue(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

function normalizeQueuePriority(value) {
  const txt = normFilterValue(value);
  if (txt.startsWith('alt')) return 'alta';
  if (txt.startsWith('med')) return 'media';
  if (txt.startsWith('baix')) return 'baixa';
  return 'baixa';
}

function normalizeQueueStatus(value) {
  const raw = String(value || '').toLowerCase();
  if (raw.includes('diverg')) return 'divergente';
  if (raw.includes('corret')) return 'correta';
  if (raw.includes('pend')) return 'pendente';
  return value || 'pendente';
}

function queuePriorityFromRow(row) {
  const hasManual = String(row.prioridade_manual || '').trim();
  if (hasManual) return normalizeQueuePriority(row.prioridade_manual);
  const status = normalizeQueueStatus(row.status_fila || row.status_fila_manual || row.status);
  const hasMissing = !!String(row.campos_ausentes_xml || '').trim();
  const hasAlerts = hasQueueAlert(row);
  if (status === 'divergente' && hasMissing) return 'alta';
  if (status === 'divergente' || hasAlerts) return 'media';
  return 'baixa';
}

function queueResponsavelFromRow(row) {
  return row.responsavel || 'Não atribuído';
}

function queueSlaFromDate(dateValue, prioridade) {
  if (!dateValue) return { label: 'Sem prazo', tone: 'neutral', hours: null };
  const base = new Date(dateValue);
  if (isNaN(base)) return { label: 'Sem prazo', tone: 'neutral', hours: null };

  const elapsedHours = Math.max(0, Math.round((Date.now() - base.getTime()) / 36e5));
  const thresholds = {
    alta: { warn: 24, danger: 48 },
    media: { warn: 36, danger: 72 },
    baixa: { warn: 72, danger: 120 },
  }[prioridade] || { warn: 36, danger: 72 };

  if (elapsedHours >= thresholds.danger) return { label: `${elapsedHours}h`, tone: 'danger', hours: elapsedHours };
  if (elapsedHours >= thresholds.warn) return { label: `${elapsedHours}h`, tone: 'warn', hours: elapsedHours };
  return { label: `${elapsedHours}h`, tone: 'ok', hours: elapsedHours };
}

function queueDivergenciaLabel(row) {
  const missing = String(row.campos_ausentes_xml || '').trim();
  const alerts = hasQueueAlert(row);
  if (missing) return 'Campos ausentes';
  if (alerts) return 'Alerta fiscal';
  return 'Sem divergência';
}

function hasQueueAlert(row) {
  const raw = String(row.alertas_fiscais || '').trim();
  if (!raw) return false;
  const txt = normFilterValue(raw);
  if (txt.includes('correto') && !txt.includes('diverg') && !txt.includes('nao deve') && !txt.includes('deveria')) {
    return false;
  }
  return true;
}

function getQueueAlertMeta(row) {
  const text = String(row.alertas_fiscais || '').trim();
  if (!text) return null;
  if (hasQueueAlert(row)) {
    return { type: 'error', title: 'Alertas fiscais', text };
  }
  return { type: 'info', title: 'Observação fiscal', text };
}

function mapQueueItem(row) {
  const statusFila = row.status_fila || row.status_fila_manual || row.status;
  const prioridade = queuePriorityFromRow(row);
  const responsavel = queueResponsavelFromRow(row);
  const entrada = row.updated_at || row.created_at || null;
  const competencia = row.competencia || fmtCompetenciaFromDate(row.data_emissao);

  return {
    ...row,
    queue_status: normalizeQueueStatus(statusFila),
    queue_empresa: clientName(row.certificado || row.cert_alias || ''),
    queue_empresa_alias: row.certificado || row.cert_alias || '',
    queue_prestador: row.razao_social || row.parte_exibicao_nome || '—',
    queue_numero_nota: row.numero_documento || row.chave_acesso || `Nota ${row.id}`,
    queue_prioridade: prioridade,
    queue_responsavel: responsavel,
    queue_divergencia: row.divergencia_fila_label || 'Sem divergência',
    queue_divergencia_final: Boolean(row.divergencia_fila_final),
    queue_entrada: entrada,
    queue_sla: queueSlaFromDate(entrada, prioridade),
    queue_competencia: competencia,
  };
}

function buildQueueTributosComparativo(row) {
  const toNum = v => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const make = (label, informado, calculado) => ({
    label,
    informado: toNum(informado),
    calculado: toNum(calculado),
  });

  return [
    make('IRRF', row.irrf, row.irrf_calculado),
    make('CSRF', row.csrf, row.csrf_calculado),
    make('ISS', row.iss, row.iss_calculado != null ? row.iss_calculado : row.iss),
  ];
}

function matchQueueSmartSearch(item, query) {
  const raw = String(query || '').trim();
  if (!raw) return true;

  const fields = {
    nota: normFilterValue(item.queue_numero_nota),
    competencia: normFilterValue(item.queue_competencia),
    empresa: normFilterValue(item.queue_empresa),
    prestador: normFilterValue(item.queue_prestador),
    valor: normFilterValue(fmtMoney(item.valor_total)),
    status: normFilterValue(item.queue_status),
    divergencia: normFilterValue(item.queue_divergencia),
    prioridade: normFilterValue(item.queue_prioridade),
    responsavel: normFilterValue(item.queue_responsavel),
    entrada: normFilterValue(fmtDate(item.queue_entrada)),
    sla: normFilterValue(item.queue_sla?.label),
  };

  const aliases = {
    n: 'nota',
    numero: 'nota',
    competencia: 'competencia',
    empresa: 'empresa',
    prestador: 'prestador',
    valor: 'valor',
    status: 'status',
    divergencia: 'divergencia',
    prioridade: 'prioridade',
    responsavel: 'responsavel',
    entrada: 'entrada',
    sla: 'sla',
  };

  const haystack = Object.values(fields).join(' ');
  const tokens = raw.split(/\s+/).map(normFilterValue).filter(Boolean);

  return tokens.every(token => {
    const idx = token.indexOf(':');
    if (idx > 0) {
      const key = aliases[token.slice(0, idx)];
      const value = token.slice(idx + 1);
      if (key && value) return fields[key].includes(value);
    }
    return haystack.includes(token);
  });
}

async function api(baseUrl, path, opts = {}) {
  const method = opts.method || 'GET';
  const headers = new Headers(opts.headers || {});
  const req = { method, headers };
  if (opts.body instanceof FormData) {
    req.body = opts.body;
  } else if (opts.body != null) {
    headers.set('Content-Type', 'application/json');
    req.body = JSON.stringify(opts.body);
  }
  const res = await fetch(`${baseUrl}${path}`, req);
  const txt = await res.text();
  let data;
  try { data = txt ? JSON.parse(txt) : null; } catch { data = txt; }
  if (!res.ok) throw new Error(data?.detail || data?.message || txt || `HTTP ${res.status}`);
  return data;
}

async function fetchProcessFileBlob(baseUrl, processId, arquivoId) {
  const res = await fetch(`${baseUrl}/processos/${processId}/arquivos/${arquivoId}/download`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
}

function downloadBrowserBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function downloadBlob(baseUrl, processId, arquivoId, filename) {
  const blob = await fetchProcessFileBlob(baseUrl, processId, arquivoId);
  downloadBrowserBlob(blob, filename);
}

async function openProcessFile(baseUrl, processId, arquivoId) {
  const blob = await fetchProcessFileBlob(baseUrl, processId, arquivoId);
  const url = URL.createObjectURL(blob);
  const popup = window.open(url, '_blank', 'noopener,noreferrer');
  if (!popup) {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

function toCSV(rows) {
  if (!rows?.length) return '';
  const h = Object.keys(rows[0]);
  const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return '\uFEFF' + [h.join(';'), ...rows.map(r => h.map(k => esc(r[k])).join(';'))].join('\n');
}

function dlCSV(rows, name) {
  const blob = new Blob([toCSV(rows)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// Exportação do relatório com cabeçalho exato no padrão da planilha de auditoria
const RELATORIO_COLUNAS = [
  { header: 'Competência',            key: 'competencia' },
  { header: 'Município',              key: 'municipio' },
  { header: 'Chave de Acesso',        key: 'chave_acesso' },
  { header: 'Data de Emissão',        key: 'data_emissao' },
  { header: 'CNPJ/CPF',              key: 'cnpj_cpf' },
  { header: 'Razão Social',           key: 'razao_social' },
  { header: 'N° Documento',           key: 'numero_documento' },
  { header: 'Valor Total',            key: 'valor_total' },
  { header: 'Valor B/C',              key: 'valor_base' },
  { header: 'Status Base de Cálculo', key: 'status_base_calculo' },
  { header: 'CSRF',                   key: 'csrf' },
  { header: 'IRRF',                   key: 'irrf' },
  { header: 'Percentual IRRF',        key: 'percentual_irrf' },
  { header: 'INSS',                   key: 'inss' },
  { header: 'ISS',                    key: 'iss' },
  { header: 'Valor Líquido',          key: 'valor_liquido' },
  { header: 'Valor Líquido Correto',  key: 'valor_liquido_correto' },
  { header: 'Status Valor Líquido',   key: 'status_valor_liquido' },
  { header: 'Campos ausentes no XML', key: 'campos_ausentes_xml' },
  { header: 'Incidência do ISS',      key: 'incidencia_iss' },
  { header: 'Data do pagamento',      key: 'data_pagamento' },
  { header: 'Código de serviço',      key: 'codigo_servico' },
  { header: 'Descrição do Serviço',   key: 'descricao_servico' },
  { header: 'Código NBS',             key: 'codigo_nbs' },
  { header: 'Código CNAE',            key: 'cnae' },
  { header: 'Descrição CNAE',         key: 'descricao_cnae' },
  { header: 'Simples Nacional / XML', key: 'simples_nacional' },
  { header: 'Consulta Simples API',   key: 'consulta_simples_api' },
  { header: 'Status Simples Nacional',key: 'status_simples_nacional' },
  { header: 'Status CSRF',            key: 'status_csrf' },
  { header: 'Status IRRF',            key: 'status_irrf' },
  { header: 'Status INSS',            key: 'status_inss' },
  { header: 'Alertas Fiscais',        key: 'alertas_fiscais' },
  { header: 'dia processado',         key: 'dia_processado' },
];

function exportRelatorioCSV(rows, name) {
  if (!rows?.length) return;
  const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';

  // Para cada linha, busca o valor pelo key — se não achar tenta variações comuns
  const get = (row, key) => {
    if (row[key] !== undefined && row[key] !== null) return row[key];
    // Fallbacks para campos que a API pode retornar com nome diferente
    const fallbacks = {
      status_base_calculo:  ['status_base_calculo', 'status_bc'],
      percentual_irrf:      ['percentual_irrf', 'perc_irrf'],
      incidencia_iss:       ['incidencia_iss', 'incidencia'],
      data_pagamento:       ['data_pagamento', 'data_pag'],
      descricao_servico:    ['descricao_servico', 'descricao_do_servico'],
      codigo_nbs:           ['codigo_nbs', 'cod_nbs'],
      cnae:                 ['cnae', 'codigo_cnae'],
      descricao_cnae:       ['descricao_cnae', 'desc_cnae'],
      simples_nacional:     ['simples_nacional', 'simples_xml', 'status_simples_nacional'],
      consulta_simples_api: ['consulta_simples_api', 'consulta_simples'],
      status_simples_nacional: ['status_simples_nacional', 'simples_nacional'],
      status_csrf:          ['status_csrf'],
      status_irrf:          ['status_irrf'],
      status_inss:          ['status_inss'],
      dia_processado:       ['dia_processado', 'created_at'],
    };
    const alts = fallbacks[key] || [];
    for (const alt of alts) {
      if (row[alt] !== undefined && row[alt] !== null) return row[alt];
    }
    return '';
  };

  const header = RELATORIO_COLUNAS.map(c => esc(c.header)).join(';');
  const body   = rows.map(r => RELATORIO_COLUNAS.map(c => esc(get(r, c.key))).join(';'));
  const csv    = '\uFEFF' + [header, ...body].join('\n');
  const blob   = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url    = URL.createObjectURL(blob);
  const a      = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

// ── Hooks ────────────────────────────────────────────────────
function useAsync(fn, deps = []) {
  const [state, setState] = useState({ data: null, loading: false, error: '' });
  const run = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: '' }));
    try {
      const data = await fn();
      setState({ data, loading: false, error: '' });
      return data;
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: e.message }));
      throw e;
    }
  }, deps);
  useEffect(() => { run().catch(() => {}); }, deps);
  return { ...state, reload: run, setState };
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type = 'info') => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  }, []);
  return { toasts, toast: add };
}

// ── Primitivos UI ────────────────────────────────────────────
function Spinner({ size = 16 }) {
  return <div className="spinner" style={{ width: size, height: size }} />;
}

function Loading({ label = 'Carregando...' }) {
  return <div className="loading-row"><Spinner />{label}</div>;
}

function Empty({ msg = 'Nenhum registro encontrado.' }) {
  return (
    <tr className="empty-row">
      <td colSpan={99}>{msg}</td>
    </tr>
  );
}

function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

function StatusBadge({ value }) {
  const map = {
    ok: 'success', valid: 'success', active: 'success', completed: 'success', correta: 'success',
    running: 'info', queued: 'warn',
    failed: 'danger', divergente: 'danger',
  };
  const tone = map[value?.toLowerCase()] || 'neutral';
  return <Badge tone={tone}>{value || 'n/a'}</Badge>;
}

function Alert({ type = 'info', children }) {
  return <div className={`alert alert-${type}`}>{children}</div>;
}

function Modal({ open, title, onClose, wide, xl, children }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className={cn('modal-box', wide && 'wide', xl && 'xl')} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="modal-close" onClick={onClose}><IconX /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>,
    document.body
  );
}

function Confirm({ open, title, msg, onOk, onCancel, danger }) {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-box" onClick={e => e.stopPropagation()}>
        <div className={cn('confirm-icon', danger ? 'danger' : 'info')}>
          {danger ? '⚠️' : 'ℹ️'}
        </div>
        <div className="confirm-title">{title}</div>
        <div className="confirm-msg">{msg}</div>
        <div className="confirm-actions">
          <button className="btn btn-ghost btn-sm" onClick={onCancel}>Cancelar</button>
          <button className={cn('btn btn-sm', danger ? 'btn-danger' : 'btn-primary')} onClick={onOk}>Confirmar</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function Pagination({ page, pageSize, total, onPage, onSize }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / pageSize));
  return (
    <div className="pagination">
      <span className="pagination-info">
        {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, total || 0)} de {total || 0}
      </span>
      <div className="pagination-controls">
        {onSize && (
          <select className="select" style={{ width: 'auto', padding: '5px 28px 5px 10px', fontSize: 12 }}
            value={pageSize} onChange={e => onSize(Number(e.target.value))}>
            {[10, 25, 50, 100].map(s => <option key={s} value={s}>{s}/pág</option>)}
          </select>
        )}
        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>←</button>
        <span style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{page}/{totalPages}</span>
        <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>→</button>
      </div>
    </div>
  );
}

function SectionHeader({ title, sub, actions }) {
  return (
    <div className="section-header">
      <div>
        <div className="section-title">{title}</div>
        {sub && <div className="section-sub">{sub}</div>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}

function QueuePriorityBadge({ value }) {
  const normalized = normalizeQueuePriority(value);
  const tone = normalized === 'alta' ? 'danger' : normalized === 'media' ? 'warn' : 'success';
  const label = normalized === 'alta' ? 'Alta' : normalized === 'media' ? 'Média' : 'Baixa';
  return <Badge tone={tone}>{label}</Badge>;
}

function QueueSlaBadge({ sla }) {
  return <span className={cn('sla-pill', `sla-pill-${sla?.tone || 'neutral'}`)}>{sla?.label || 'Sem prazo'}</span>;
}

function FilterBar({ children, label = 'Filtros', defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="filter-bar">
      <div className="filter-bar-head" onClick={() => setOpen(o => !o)}>
        <span className="filter-bar-head-left">
          <IconFilter />
          {label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{open ? '▲' : '▼'}</span>
      </div>
      <div className={cn('filter-bar-body', !open && 'hidden')}>
        {children}
      </div>
    </div>
  );
}

function getQueueDefaultFilters() {
  const baseDate = yesterday();
  return {
    status: '',
    empresa: '',
    prioridade: '',
    responsavel: '',
    data_tipo: 'entrada',
    data_inicio: baseDate,
    data_fim: baseDate,
  };
}

function normalizeQueueDocumentToken(value) {
  return normFilterValue(value).replace(/[^a-z0-9]/g, '');
}

function pickQueueDocument(files, row) {
  if (!Array.isArray(files) || !files.length || !row) return null;
  const tokens = [
    row.numero_documento,
    row.queue_numero_nota,
    row.chave_acesso,
    row.id,
  ].map(normalizeQueueDocumentToken).filter(Boolean);

  const ranked = files
    .map(file => {
      const haystack = normalizeQueueDocumentToken(file.nome_arquivo || file.filename || '');
      const score = tokens.reduce((best, token) => haystack.includes(token) ? Math.max(best, token.length) : best, 0);
      return { file, score };
    })
    .sort((a, b) => b.score - a.score);

  if (ranked[0]?.score > 0) return ranked[0].file;
  return files.length === 1 ? files[0] : null;
}

function QueueNoteDocuments({ baseUrl, selected, toast }) {
  const [pendingAction, setPendingAction] = useState('');
  const processId = selected?.processo_id;
  const docsData = useAsync(() => {
    if (!processId) return Promise.resolve({ pdfs: [], xmls: [] });
    return Promise.allSettled([
      api(baseUrl, `/processos/${processId}/pdfs`),
      api(baseUrl, `/processos/${processId}/xmls`),
    ]).then(([pdfs, xmls]) => ({
      pdfs: pdfs.status === 'fulfilled' && Array.isArray(pdfs.value) ? pdfs.value : [],
      xmls: xmls.status === 'fulfilled' && Array.isArray(xmls.value) ? xmls.value : [],
    }));
  }, [baseUrl, processId]);

  const pdfFile = useMemo(() => pickQueueDocument(docsData.data?.pdfs || [], selected), [docsData.data, selected]);
  const xmlFile = useMemo(() => pickQueueDocument(docsData.data?.xmls || [], selected), [docsData.data, selected]);

  const handleAction = async (kind, file, mode) => {
    if (!file?.processo_id || !file?.id) return;
    const key = `${kind}-${mode}`;
    setPendingAction(key);
    try {
      if (mode === 'view') await openProcessFile(baseUrl, file.processo_id, file.id);
      else await downloadBlob(baseUrl, file.processo_id, file.id, file.nome_arquivo || `${kind}.bin`);
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setPendingAction('');
    }
  };

  return (
    <div className="queue-detail-block">
      <div className="card-title" style={{ marginBottom: 12 }}>Documentos da nota</div>

      {!processId ? (
        <Alert type="info">Esta nota ainda não possui processo vinculado para consulta de XML/PDF.</Alert>
      ) : docsData.loading ? (
        <Loading label="Carregando documentos..." />
      ) : docsData.error ? (
        <Alert type="error">{docsData.error}</Alert>
      ) : (!pdfFile && !xmlFile) ? (
        <Alert type="info">Nenhum XML ou PDF correspondente foi encontrado para esta nota.</Alert>
      ) : (
        <div className="queue-docs-grid">
          {xmlFile ? (
            <div className="queue-doc-card">
              <div className="queue-doc-title">XML</div>
              <div className="queue-doc-name" title={xmlFile.nome_arquivo}>{xmlFile.nome_arquivo}</div>
              <div className="queue-doc-actions">
                <button className="btn btn-ghost btn-sm" disabled={pendingAction === 'xml-view'} onClick={() => handleAction('xml', xmlFile, 'view')}>
                  {pendingAction === 'xml-view' ? <Spinner size={12} /> : 'Ver XML'}
                </button>
                <button className="btn btn-primary btn-sm" disabled={pendingAction === 'xml-download'} onClick={() => handleAction('xml', xmlFile, 'download')}>
                  {pendingAction === 'xml-download' ? <Spinner size={12} /> : 'Baixar XML'}
                </button>
              </div>
            </div>
          ) : null}

          {pdfFile ? (
            <div className="queue-doc-card">
              <div className="queue-doc-title">PDF</div>
              <div className="queue-doc-name" title={pdfFile.nome_arquivo}>{pdfFile.nome_arquivo}</div>
              <div className="queue-doc-actions">
                <button className="btn btn-ghost btn-sm" disabled={pendingAction === 'pdf-view'} onClick={() => handleAction('pdf', pdfFile, 'view')}>
                  {pendingAction === 'pdf-view' ? <Spinner size={12} /> : 'Ver PDF'}
                </button>
                <button className="btn btn-primary btn-sm" disabled={pendingAction === 'pdf-download'} onClick={() => handleAction('pdf', pdfFile, 'download')}>
                  {pendingAction === 'pdf-download' ? <Spinner size={12} /> : 'Baixar PDF'}
                </button>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

function QueueAnalysisContent({
  selected, alertMeta, tributosComparativo, baseUrl, toast,
  statusFila, setStatusFila, prioridadeFila, setPrioridadeFila,
  responsavelFila, setResponsavelFila, obsInterna, setObsInterna,
  salvarObservacao, savingObs,
}) {
  if (!selected) return null;

  const queueStatus = selected.status_fila_final || selected.queue_status || selected.status || 'pendente';

  return (
    <div className="queue-detail">
      <div className="queue-detail-grid">
        <div className="queue-detail-block">
          <div className="card-title" style={{ marginBottom: 12 }}>Resumo operacional</div>
          <div className="queue-detail-row"><span>Empresa</span><strong>{selected.queue_empresa}</strong></div>
          <div className="queue-detail-row"><span>Prestador</span><strong>{selected.queue_prestador}</strong></div>
          <div className="queue-detail-row"><span>Valor</span><strong>{fmtMoney(selected.valor_total)}</strong></div>
          <div className="queue-detail-row"><span>Entrada</span><strong>{fmtDate(selected.queue_entrada)}</strong></div>
          <div className="queue-detail-row"><span>Responsável</span><strong>{selected.queue_responsavel}</strong></div>
        </div>

        <div className="queue-detail-block">
          <div className="card-title" style={{ marginBottom: 12 }}>Classificação</div>
          <div className="queue-detail-row"><span>Status</span><StatusBadge value={queueStatus} /></div>
          <div className="queue-detail-row"><span>Prioridade</span><QueuePriorityBadge value={selected.queue_prioridade} /></div>
          <div className="queue-detail-row"><span>SLA</span><QueueSlaBadge sla={selected.queue_sla} /></div>
          <div className="queue-detail-row"><span>Divergência</span><Badge tone={selected.queue_divergencia_final ? 'warn' : 'success'}>{selected.queue_divergencia}</Badge></div>
        </div>
      </div>

      {!!selected.campos_ausentes_xml && (
        <Alert type="warn">
          <strong>Campos ausentes no XML:</strong> {selected.campos_ausentes_xml}
        </Alert>
      )}

      {!!alertMeta && (
        <Alert type={alertMeta.type}>
          <strong>{alertMeta.title}:</strong> {alertMeta.text}
        </Alert>
      )}

      <div className="queue-detail-grid">
        <div className="queue-detail-block">
          <div className="card-title" style={{ marginBottom: 12 }}>Identificação da nota</div>
          <div className="queue-detail-row"><span>ID</span><strong className="mono">{selected.id}</strong></div>
          <div className="queue-detail-row"><span>Processo</span><strong className="mono">{selected.processo_id || '—'}</strong></div>
          <div className="queue-detail-row"><span>Chave</span><strong className="mono">{selected.chave_acesso || '—'}</strong></div>
          <div className="queue-detail-row"><span>CNPJ/CPF</span><strong>{selected.cnpj_cpf || '—'}</strong></div>
          <div className="queue-detail-row"><span>Tipo</span><strong>{selected.tipo_nota || '—'}</strong></div>
        </div>

        <div className="queue-detail-block">
          <div className="card-title" style={{ marginBottom: 12 }}>Contexto operacional</div>
          <div className="queue-detail-row"><span>Valor líquido</span><strong>{fmtMoney(selected.valor_liquido)}</strong></div>
          <div className="queue-detail-row"><span>IRRF</span><strong>{fmtMoney(selected.irrf)}</strong></div>
          <div className="queue-detail-row"><span>INSS</span><strong>{fmtMoney(selected.inss)}</strong></div>
          <div className="queue-detail-row"><span>ISS</span><strong>{fmtMoney(selected.iss)}</strong></div>
          <div className="queue-detail-row"><span>Atualização</span><strong>{fmtDate(selected.updated_at || selected.created_at)}</strong></div>
        </div>
      </div>

      <QueueNoteDocuments baseUrl={baseUrl} selected={selected} toast={toast} />

      <div className="queue-detail-block">
        <div className="card-title" style={{ marginBottom: 12 }}>Comparativo de tributos</div>
        <div className="table-wrap queue-compare-table" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Tributo</th>
                <th>Informado</th>
                <th>Calculado</th>
                <th>Diferença</th>
              </tr>
            </thead>
            <tbody>
              {tributosComparativo.map(item => {
                const diff = item.calculado - item.informado;
                const tone = Math.abs(diff) > 0.009 ? 'danger' : 'neutral';
                const diffLabel = Math.abs(diff) > 0.009 ? `${diff > 0 ? '+' : ''}${fmtMoney(diff)}` : '-';
                return (
                  <tr key={item.label}>
                    <td className="primary">{item.label}</td>
                    <td className="mono right">{fmtMoney(item.informado)}</td>
                    <td className="mono right">{fmtMoney(item.calculado)}</td>
                    <td className={`mono right compare-diff compare-diff-${tone}`}>{diffLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="queue-detail-grid">
        <div className="queue-detail-block">
          <div className="card-title" style={{ marginBottom: 12 }}>Análise interna</div>
          <div className="field">
            <label className="label">Status da fila</label>
            <select className="select" value={statusFila} onChange={e => setStatusFila(e.target.value)}>
              <option value="pendente">Pendente</option>
              <option value="divergente">Divergente</option>
              <option value="correta">Correta</option>
            </select>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="label">Prioridade</label>
            <select className="select" value={prioridadeFila} onChange={e => setPrioridadeFila(e.target.value)}>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
          <div className="field" style={{ marginTop: 12 }}>
            <label className="label">Responsável</label>
            <input className="input" value={responsavelFila} onChange={e => setResponsavelFila(e.target.value)} placeholder="Nome do responsável" />
          </div>
        </div>

        <div className="queue-detail-block">
          <div className="card-title" style={{ marginBottom: 12 }}>Observação interna</div>
          <div className="field">
            <label className="label">Anotações do auditor</label>
            <textarea className="textarea" rows="6" value={obsInterna} onChange={e => setObsInterna(e.target.value)} placeholder="Registre contexto, decisão tomada ou encaminhamento interno." />
          </div>
          <div className="queue-detail-actions">
            <button className="btn btn-primary btn-sm" onClick={salvarObservacao} disabled={savingObs}>
              {savingObs ? <Spinner size={13} /> : 'Salvar análise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Toast container ──────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

// ── Page: Dashboard ──────────────────────────────────────────
function DashboardPage({ baseUrl, toast }) {
  const health  = useAsync(() => api(baseUrl, '/health'), [baseUrl]);
  const execs   = useAsync(() => api(baseUrl, '/execucoes?page=1&page_size=5'), [baseUrl]);
  const procs   = useAsync(() => api(baseUrl, '/processos?page=1&page_size=5'), [baseUrl]);
  const agends  = useAsync(() => api(baseUrl, '/agendamentos'), [baseUrl]);

  const stats = useMemo(() => ({
    status:    health.data?.status || 'offline',
    execucoes: execs.data?.total || 0,
    processos: procs.data?.total || 0,
    jobs:      agends.data?.jobs?.filter(j => j.running || j.ativo)?.length || 0,
  }), [health.data, execs.data, procs.data, agends.data]);

  return (
    <div className="page-enter">
      <SectionHeader title="Dashboard" sub="Visão geral do sistema de auditoria fiscal" />

      <div className="stat-grid">
        <div className={cn('stat-card', stats.status === 'ok' ? 'success' : 'danger')}>
          <div className="stat-label">API</div>
          <div className="stat-value">{stats.status}</div>
        </div>
        <div className="stat-card info">
          <div className="stat-label">Execuções</div>
          <div className="stat-value">{stats.execucoes}</div>
        </div>
        <div className="stat-card neutral">
          <div className="stat-label">Processos</div>
          <div className="stat-value">{stats.processos}</div>
        </div>
        <div className="stat-card warn">
          <div className="stat-label">Jobs ativos</div>
          <div className="stat-value">{stats.jobs}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Execuções recentes</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {execs.loading ? <div style={{ padding: 20 }}><Loading /></div> : (
              <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr>
                    <th>Cliente</th><th>Período</th><th>Status</th><th>Criado em</th>
                  </tr></thead>
                  <tbody>
                    {(execs.data?.items || []).length === 0 ? <Empty msg="Nenhuma execução" /> :
                      (execs.data?.items || []).map(r => (
                        <tr key={r.job_id}>
                          <td className="primary">{r.client_name}</td>
                          <td className="mono">{r.period_start} → {r.period_end}</td>
                          <td><StatusBadge value={r.status} /></td>
                          <td>{fmtDate(r.created_at)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Processos recentes</span></div>
          <div className="card-body" style={{ padding: 0 }}>
            {procs.loading ? <div style={{ padding: 20 }}><Loading /></div> : (
              <div className="table-wrap" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead><tr>
                    <th>Alias</th><th>Tipo</th><th>Status</th><th>Notas</th>
                  </tr></thead>
                  <tbody>
                    {(procs.data?.items || []).length === 0 ? <Empty msg="Nenhum processo" /> :
                      (procs.data?.items || []).map(r => (
                        <tr key={r.id}>
                          <td className="primary" style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                            title={clientName(r.cert_alias)}>{clientName(r.cert_alias)}</td>
                          <td><Badge tone="neutral">{r.tipo_nota}</Badge></td>
                          <td><StatusBadge value={r.status} /></td>
                          <td className="mono">{r.total_notas}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page: Execução ───────────────────────────────────────────
function ExecucaoPage({ baseUrl, toast }) {
  const certs = useAsync(() => api(baseUrl, '/certificados'), [baseUrl]);
  const creds = useAsync(() => api(baseUrl, '/credenciais'), [baseUrl]);

  const [form, setForm] = useState(() => {
    const saved = localStorage.getItem('nfse_last_dir') || './saida';
    return {
      base_dir: saved,
      cert_aliases: [],
      start: today(),
      end: today(),
      headless: true,
      chunk_days: 30,
      consultar_api: true,
      login_type: 'certificado',
      tipo_nota: 'tomados',
      hora_execucao: '06:00',
    };
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [modoAuto, setModoAuto] = useState(false);
  const [showDirHistory, setShowDirHistory] = useState(false);

  // Histórico dos últimos 5 diretórios usados
  const getDirHistory = () => {
    try { return JSON.parse(localStorage.getItem('nfse_dir_history') || '[]'); } catch { return []; }
  };
  const saveDirHistory = (dir) => {
    if (!dir || dir === './saida') return;
    const h = [dir, ...getDirHistory().filter(d => d !== dir)].slice(0, 5);
    localStorage.setItem('nfse_dir_history', JSON.stringify(h));
    localStorage.setItem('nfse_last_dir', dir);
  };

  const isCred = form.login_type === 'cpf_cnpj';
  const lista = isCred
    ? (creds.data?.credenciais || [])
    : (certs.data?.certificados || []);

  const toggle = alias => setForm(f => ({
    ...f,
    cert_aliases: f.cert_aliases.includes(alias)
      ? f.cert_aliases.filter(a => a !== alias)
      : [...f.cert_aliases, alias],
  }));

  const executar = async (path) => {
    if (!form.cert_aliases.length) { toast('Selecione ao menos um alias.', 'error'); return; }
    setLoading(true); setResult(null);
    try {
      const payload = { ...form, chunk_days: Number(form.chunk_days) };
      if (modoAuto) {
        const d = await api(baseUrl, '/agendar', { method: 'POST', body: payload });
        setResult(d);
        saveDirHistory(form.base_dir);
        toast(`Modo automático ativado — próxima execução: ${d.proxima_execucao ? fmtDate(d.proxima_execucao) : 'em breve'}`, 'success');
      } else {
        const d = await api(baseUrl, '/executar', { method: 'POST', body: payload });
        setResult(d);
        saveDirHistory(form.base_dir);
        toast(`Execução iniciada — Job: ${d.job_id?.slice(0, 8)}...`, 'success');
      }
    } catch (e) { toast(e.message, 'error'); } finally { setLoading(false); }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="page-enter">
      <SectionHeader title="Execução" sub="Disparo manual ou agendamento automático da automação" />

      {result && (
        <Alert type="success">
          {modoAuto
            ? `✓ Modo automático ativado. Próxima execução: ${result.proxima_execucao ? fmtDate(result.proxima_execucao) : '—'}`
            : `✓ Execução iniciada. Job ID: ${result.job_id}`}
        </Alert>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
        {/* Configuração */}
        <div className="card">
          <div className="card-header"><span className="card-title">Configuração</span></div>
          <div className="card-body">
            <div className="form-grid">

              {/* Modo */}
              <div>
                <div className="label" style={{ marginBottom: 8 }}>Modo de operação</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={cn('btn btn-sm', !modoAuto ? 'btn-primary' : 'btn-ghost')}
                    onClick={() => setModoAuto(false)}>
                    ▶ Manual
                  </button>
                  <button
                    className={cn('btn btn-sm', modoAuto ? 'btn-primary' : 'btn-ghost')}
                    onClick={() => setModoAuto(true)}>
                    ⏱ Automático — Últimos 30 dias
                  </button>
                </div>
              </div>

              {/* Período — só no manual */}
              {!modoAuto && (
                <div className="form-grid form-cols-2">
                  <div className="field">
                    <label className="label">Data inicial</label>
                    <input type="date" className="input" value={form.start} onChange={e => f('start', e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="label">Data final</label>
                    <input type="date" className="input" value={form.end} onChange={e => f('end', e.target.value)} />
                  </div>
                </div>
              )}

              {/* Horário — só no automático */}
              {modoAuto && (
                <div className="field" style={{ maxWidth: 180 }}>
                  <label className="label">Horário de execução diária</label>
                  <input type="time" className="input" value={form.hora_execucao} onChange={e => f('hora_execucao', e.target.value)} />
                  <span className="input-hint">A execução ocorrerá todos os dias neste horário</span>
                </div>
              )}

              <div className="form-grid form-cols-2">
                <div className="field">
                  <label className="label">Tipo de login</label>
                  <select className="select" value={form.login_type} onChange={e => { f('login_type', e.target.value); f('cert_aliases', []); }}>
                    <option value="certificado">Certificado Digital (PFX)</option>
                    <option value="cpf_cnpj">CPF/CNPJ e Senha</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Tipo de nota</label>
                  <select className="select" value={form.tipo_nota} onChange={e => f('tipo_nota', e.target.value)}>
                    <option value="tomados">Tomados (Recebidas)</option>
                    <option value="prestados">Prestados (Emitidas)</option>
                  </select>
                </div>
              </div>

              <div className="form-grid form-cols-2">
                <div className="field">
                  <label className="label">Chunk days</label>
                  <input type="number" className="input" value={form.chunk_days} min={1} max={90}
                    onChange={e => f('chunk_days', e.target.value)} />
                </div>
                <div className="field" style={{ position: 'relative' }}>
                  <label className="label">Diretório de saída</label>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <input
                      className="input"
                      value={form.base_dir}
                      onChange={e => { f('base_dir', e.target.value); setShowDirHistory(false); }}
                      onFocus={() => getDirHistory().length > 0 && setShowDirHistory(true)}
                      onBlur={() => setTimeout(() => setShowDirHistory(false), 200)}
                      placeholder="Ex: C:\Documentos\NFS-e ou /home/usuario/nfse"
                      style={{ flex: 1 }}
                    />
                    <button type="button" className="btn btn-ghost" style={{ flexShrink: 0, padding: '0 12px' }}
                      title="Ver últimos diretórios usados"
                      onClick={() => setShowDirHistory(h => !h)}>
                      <IconFolder />
                    </button>
                  </div>
                  {/* Dropdown de histórico */}
                  {showDirHistory && getDirHistory().length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50,
                      background: 'var(--surface-2)', border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)', marginTop: 4, boxShadow: 'var(--shadow)',
                      overflow: 'hidden',
                    }}>
                      <div style={{ padding: '6px 12px 4px', fontSize: 10, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                        Usados recentemente
                      </div>
                      {getDirHistory().map(dir => (
                        <div key={dir}
                          style={{ padding: '8px 12px', fontSize: 12, color: 'var(--text-2)', cursor: 'pointer', fontFamily: 'var(--font-mono)', borderTop: '1px solid var(--border-soft)' }}
                          onMouseDown={() => { f('base_dir', dir); setShowDirHistory(false); }}>
                          {dir}
                        </div>
                      ))}
                    </div>
                  )}
                  <span className="input-hint">
                    Digite o caminho completo da pasta onde os arquivos serão salvos.
                    Windows: <code style={{ color: 'var(--accent)', fontSize: 10 }}>C:\Users\Nome\Documentos\NFS-e</code>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 20 }}>
                <label className="check-label">
                  <input type="checkbox" checked={form.headless} onChange={e => f('headless', e.target.checked)} />
                  Headless
                </label>
                <label className="check-label">
                  <input type="checkbox" checked={form.consultar_api} onChange={e => f('consultar_api', e.target.checked)} />
                  Consultar API (CNPJ)
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Seleção de aliases */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">{isCred ? 'Credenciais' : 'Certificados'}</span>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{form.cert_aliases.length} selecionado(s)</span>
          </div>
          <div className="card-body" style={{ paddingTop: 12 }}>
            {(isCred ? creds.loading : certs.loading) ? <Loading /> : (
              <div className="alias-list">
                {lista.length === 0 && (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: 12 }}>
                    Nenhum {isCred ? 'credencial' : 'certificado'} cadastrado
                  </div>
                )}
                {lista.map(item => {
                  const alias = item.alias;
                  const checked = form.cert_aliases.includes(alias);
                  return (
                    <div key={alias} className="alias-item" onClick={() => toggle(alias)}>
                      <input type="checkbox" checked={checked} onChange={() => {}} />
                      <div>
                        <div className="alias-item-name">{clientName(alias)}</div>
                        <div className="alias-item-sub">{isCred ? item.document : alias.split(' - ')[0]}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary" disabled={loading || !form.cert_aliases.length} onClick={executar}
                style={{ justifyContent: 'center' }}>
                {loading ? <><Spinner size={14} /> Processando...</> : modoAuto ? '⏱ Ativar modo automático' : '▶ Executar agora'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page: Agendamentos ───────────────────────────────────────
function AgendamentosPage({ baseUrl, toast }) {
  const list = useAsync(() => api(baseUrl, '/agendamentos'), [baseUrl]);
  const [confirm, setConfirm] = useState(null);
  const [statusId, setStatusId] = useState('');
  const [statusRes, setStatusRes] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  const cancelar = async () => {
    try {
      await api(baseUrl, `/agendamentos/${confirm}`, { method: 'DELETE' });
      toast('Agendamento cancelado.', 'success');
      setConfirm(null);
      list.reload();
    } catch (e) { toast(e.message, 'error'); setConfirm(null); }
  };

  const consultarStatus = async () => {
    if (!statusId.trim()) return;
    setStatusLoading(true); setStatusRes(null);
    try {
      const d = await api(baseUrl, `/status/${statusId.trim()}`);
      setStatusRes(d);
    } catch (e) { toast(e.message, 'error'); } finally { setStatusLoading(false); }
  };

  const jobs = list.data?.jobs || [];
  const ativos = jobs.filter(j => j.running || j.ativo);

  return (
    <div className="page-enter">
      <SectionHeader
        title="Agendamentos"
        sub="Jobs automáticos e consulta de status"
        actions={<button className="btn btn-ghost btn-sm" onClick={list.reload}><IconRefresh /> Atualizar</button>}
      />

      {/* Consulta de status */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-header"><span className="card-title">Consultar status de execução</span></div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 8, maxWidth: 560 }}>
            <input className="input" placeholder="Job ID ou processo ID" value={statusId}
              onChange={e => setStatusId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && consultarStatus()} />
            <button className="btn btn-primary" disabled={statusLoading} onClick={consultarStatus}>
              {statusLoading ? <Spinner size={14} /> : 'Consultar'}
            </button>
          </div>
          {statusRes && (
            <div style={{ marginTop: 16 }}>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-item-label">Job ID</div>
                  <div className="info-item-value" style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{statusRes.job_id}</div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">Status</div>
                  <div className="info-item-value"><StatusBadge value={statusRes.status} /></div>
                </div>
                <div className="info-item">
                  <div className="info-item-label">Processos</div>
                  <div className="info-item-value">{statusRes.processos?.length || 0}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lista de jobs */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Jobs agendados</span>
          <Badge tone={ativos.length > 0 ? 'success' : 'neutral'}>{ativos.length} ativo(s)</Badge>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {list.loading ? <div style={{ padding: 20 }}><Loading /></div> : (
            <div className="table-wrap scrollable" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr>
                  <th>Job ID</th><th>Descrição</th><th>Intervalo</th>
                  <th>Última execução</th><th>Próxima</th><th>Status</th><th></th>
                </tr></thead>
                <tbody>
                  {jobs.length === 0 ? <Empty msg="Nenhum agendamento ativo" /> :
                    jobs.map(j => (
                      <tr key={j.job_id}>
                        <td className="mono" style={{ fontSize: 11 }}>{String(j.job_id).slice(0, 8)}…</td>
                        <td className="primary" style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                          title={j.descricao}>{j.descricao || '—'}</td>
                        <td className="mono">{j.intervalo_segundos ? `${Math.round(j.intervalo_segundos / 3600)}h` : '—'}</td>
                        <td>{j.ultima_execucao ? fmtDate(j.ultima_execucao) : '—'}</td>
                        <td>{j.proxima_execucao ? fmtDate(j.proxima_execucao) : '—'}</td>
                        <td><StatusBadge value={j.running || j.ativo ? 'running' : 'queued'} /></td>
                        <td className="actions">
                          {j.job_id !== '__minio_cleanup__' && (
                            <button className="btn btn-danger btn-xs" onClick={() => setConfirm(j.job_id)}>
                              <IconStop /> Cancelar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Confirm open={!!confirm} title="Cancelar agendamento"
        msg={`Deseja cancelar o job ${String(confirm || '').slice(0, 8)}…? O processo não será mais executado automaticamente.`}
        danger onOk={cancelar} onCancel={() => setConfirm(null)} />
    </div>
  );
}

// ── Page: Processos ──────────────────────────────────────────
// Nível 1: cards de empresas
// Nível 2: lista de processos da empresa selecionada
// Nível 3: modal com pastas NFS-e / XML / Planilha + notas

// Ícones de pasta por tipo
function IconPastaPDF({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 8a2 2 0 012-2h4.5l2 2H20a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" fill="#f06560" opacity="0.85"/>
    </svg>
  );
}
function IconPastaXML({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 8a2 2 0 012-2h4.5l2 2H20a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" fill="#3d8ef0" opacity="0.85"/>
    </svg>
  );
}
function IconPastaPlanilha({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 8a2 2 0 012-2h4.5l2 2H20a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" fill="#2dd4a0" opacity="0.85"/>
    </svg>
  );
}
function IconPastaNotas({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M2 8a2 2 0 012-2h4.5l2 2H20a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z" fill="#f5a623" opacity="0.85"/>
    </svg>
  );
}

function FolderTab({ folderIcon, label, count, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '9px 18px',
        background: active ? 'var(--surface-2)' : 'var(--surface)',
        border: '1px solid var(--border)',
        borderBottom: active ? '1px solid var(--surface-2)' : '1px solid var(--border)',
        borderRadius: '8px 8px 0 0',
        color: active ? 'var(--text)' : 'var(--text-3)',
        fontFamily: 'var(--font-sans)',
        fontSize: 13, fontWeight: active ? 600 : 400,
        cursor: 'pointer', transition: 'all .15s',
        whiteSpace: 'nowrap',
        marginBottom: active ? '-1px' : 0,
        zIndex: active ? 2 : 1,
        position: 'relative',
      }}
    >
      {folderIcon}
      {label}
      {count > 0 && (
        <span style={{
          background: active ? 'var(--accent-dim)' : 'var(--surface-3)',
          color: active ? 'var(--accent)' : 'var(--text-3)',
          border: active ? '1px solid rgba(61,142,240,.3)' : '1px solid transparent',
          borderRadius: 99, fontSize: 10, fontWeight: 700,
          padding: '1px 7px', minWidth: 20, textAlign: 'center',
        }}>{count}</span>
      )}
    </button>
  );
}

function FileRow({ file, baseUrl, toast }) {
  const [loading, setLoading] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const ext = file.nome_arquivo?.split('.').pop()?.toUpperCase() || '';

  // Ícone SVG por tipo de arquivo (estilo documento)
  const fileIcon = {
    PDF: (
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
        <rect x="0" y="0" width="28" height="34" rx="3" fill="#f06560" opacity="0.12"/>
        <path d="M17 0v7h7" fill="none" stroke="#f06560" strokeWidth="1" opacity="0.6"/>
        <path d="M17 0L28 11v23H0V0h17z" fill="none" stroke="#f06560" strokeWidth="1" opacity="0.5"/>
        <text x="14" y="25" textAnchor="middle" fill="#f06560" fontSize="8" fontWeight="700" fontFamily="monospace">PDF</text>
      </svg>
    ),
    XML: (
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
        <rect x="0" y="0" width="28" height="34" rx="3" fill="#3d8ef0" opacity="0.12"/>
        <path d="M17 0v7h7" fill="none" stroke="#3d8ef0" strokeWidth="1" opacity="0.6"/>
        <path d="M17 0L28 11v23H0V0h17z" fill="none" stroke="#3d8ef0" strokeWidth="1" opacity="0.5"/>
        <text x="14" y="25" textAnchor="middle" fill="#3d8ef0" fontSize="8" fontWeight="700" fontFamily="monospace">XML</text>
      </svg>
    ),
    XLSX: (
      <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
        <rect x="0" y="0" width="28" height="34" rx="3" fill="#2dd4a0" opacity="0.12"/>
        <path d="M17 0v7h7" fill="none" stroke="#2dd4a0" strokeWidth="1" opacity="0.6"/>
        <path d="M17 0L28 11v23H0V0h17z" fill="none" stroke="#2dd4a0" strokeWidth="1" opacity="0.5"/>
        <text x="14" y="25" textAnchor="middle" fill="#2dd4a0" fontSize="7" fontWeight="700" fontFamily="monospace">XLSX</text>
      </svg>
    ),
  }[ext] || (
    <svg width="28" height="34" viewBox="0 0 28 34" fill="none">
      <rect x="0" y="0" width="28" height="34" rx="3" fill="#505c72" opacity="0.2"/>
      <path d="M17 0L28 11v23H0V0h17z" fill="none" stroke="#505c72" strokeWidth="1" opacity="0.5"/>
    </svg>
  );

  const handleDownload = async () => {
    setLoading(true);
    try {
      await downloadBlob(baseUrl, file.processo_id, file.id, file.nome_arquivo);
    } catch(e) {
      toast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '8px 10px',
        background: hovered ? 'var(--surface-3)' : 'transparent',
        borderRadius: 6,
        marginBottom: 2,
        cursor: 'default',
        transition: 'background .1s',
      }}
    >
      {/* Ícone de documento */}
      <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
        {fileIcon}
      </div>

      {/* Nome do arquivo */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 12.5, color: 'var(--text)',
          fontFamily: 'var(--font-sans)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {file.nome_arquivo}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
          {file.competencia && (
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
              Competência {file.competencia}
            </span>
          )}
          {file.tamanho_bytes && (
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
              {(file.tamanho_bytes / 1024).toFixed(0)} KB
            </span>
          )}
          {file.created_at && (
            <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>
              {new Date(file.created_at).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>

      {/* Botão download — aparece só no hover */}
      <button
        className="btn btn-ghost btn-xs"
        onClick={handleDownload}
        disabled={loading}
        style={{ flexShrink: 0, opacity: hovered ? 1 : 0.4, transition: 'opacity .15s' }}
      >
        {loading ? <Spinner size={12} /> : <><IconDown /> Baixar</>}
      </button>
    </div>
  );
}

function ProcessoModal({ selected, baseUrl, toast, onClose }) {
  const [tab, setTab] = React.useState('pdfs');
  const [dlZip, setDlZip] = React.useState(false);
  const [dlCsv, setDlCsv] = React.useState(false);
  const [dlZipProgress, setDlZipProgress] = React.useState('');

  if (!selected) return null;
  const { proc, pdfs, xmls, planilhas, summary, relatorio } = selected;
  if (!proc) return null;

  const handleZip = async () => {
    setDlZip(true);
    setDlZipProgress('Preparando arquivos...');
    try {
      const totalArqs = (pdfs?.length||0) + (xmls?.length||0) + (planilhas?.length||0);
      setDlZipProgress(`Baixando ${totalArqs} arquivo${totalArqs!==1?'s':''}...`);

      const res = await fetch(`${baseUrl}/processos/${proc.id}/download-zip`);
      if (!res.ok) throw new Error('Erro ao gerar ZIP');

      setDlZipProgress('Empacotando ZIP...');
      const blob = await res.blob();
      const sizeMB = (blob.size / 1024 / 1024).toFixed(1);

      setDlZipProgress(`Iniciando download (${sizeMB} MB)...`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `processo_${proc.id.slice(0,8)}_${clientName(proc.cert_alias).slice(0,20)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast(`ZIP baixado com sucesso (${sizeMB} MB)`, 'success');
    } catch(e) { toast(e.message, 'error'); } finally {
      setDlZip(false);
      setDlZipProgress('');
    }
  };

  const handleCsv = async () => {
    setDlCsv(true);
    try {
      const res = await fetch(`${baseUrl}/processos/${proc.id}/relatorio-csv`);
      if (!res.ok) throw new Error('Erro ao gerar CSV');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `relatorio_${proc.id.slice(0,8)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch(e) { toast(e.message, 'error'); } finally { setDlCsv(false); }
  };

  const totalArquivos = (pdfs?.length || 0) + (xmls?.length || 0) + (planilhas?.length || 0);

  return (
    <Modal
      open={true}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: 15 }}>{clientName(proc.cert_alias)}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
              {fmtDateShort(proc.start_date)} → {fmtDateShort(proc.end_date)} · {proc.tipo_nota}
            </div>
          </div>
          <StatusBadge value={proc.status} />
        </div>
      }
      onClose={onClose}
      wide
    >
      {/* ── Resumo financeiro ── */}
      {summary && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20,
        }}>
          {[
            { label: 'Total notas',  value: summary.total_notas,         mono: true },
            { label: 'Corretas',     value: summary.total_corretas,       color: 'var(--green)' },
            { label: 'Divergentes',  value: summary.total_divergentes,    color: summary.total_divergentes > 0 ? 'var(--amber)' : 'var(--text-3)' },
            { label: 'Valor total',  value: fmtMoney(summary.valor_total_processado), mono: true },
          ].map(({ label, value, color, mono }) => (
            <div key={label} style={{
              background: 'var(--surface-2)', borderRadius: 'var(--radius)',
              padding: '12px 14px', border: '1px solid var(--border-soft)',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 4 }}>{label}</div>
              <div style={{
                fontSize: 16, fontWeight: 600,
                color: color || 'var(--text)',
                fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
              }}>{value ?? '—'}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Botões de download rápido ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        <button className="btn btn-sm" onClick={handleZip} disabled={dlZip || totalArquivos === 0}
          style={{ minWidth: 180, justifyContent: 'center' }}>
          {dlZip ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Spinner size={12} />
              <span style={{ fontSize: 11 }}>{dlZipProgress || 'Aguarde...'}</span>
            </span>
          ) : (
            <><IconDown /> Baixar tudo (.zip)</>
          )}
        </button>
        <button className="btn btn-ghost btn-sm" onClick={handleCsv} disabled={dlCsv}>
          {dlCsv ? <Spinner size={12} /> : <IconDown />}
          Exportar CSV
        </button>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-3)', alignSelf: 'center' }}>
          {totalArquivos} arquivo{totalArquivos !== 1 ? 's' : ''} disponíveis
        </span>
      </div>

      {/* ── Abas de pastas ── */}
      <div style={{
        display: 'flex', alignItems: 'flex-end',
        borderBottom: '1px solid var(--border)',
        marginBottom: 0, gap: 4, paddingTop: 8,
      }}>
        <FolderTab
          folderIcon={<IconPastaPDF />}
          label="pdf"
          count={pdfs?.length || 0}
          active={tab === 'pdfs'}
          onClick={() => setTab('pdfs')}
        />
        <FolderTab
          folderIcon={<IconPastaXML />}
          label="xml"
          count={xmls?.length || 0}
          active={tab === 'xmls'}
          onClick={() => setTab('xmls')}
        />
        <FolderTab
          folderIcon={<IconPastaPlanilha />}
          label="planilhas"
          count={planilhas?.length || 0}
          active={tab === 'planilhas'}
          onClick={() => setTab('planilhas')}
        />
        <FolderTab
          folderIcon={<IconPastaNotas />}
          label="notas"
          count={relatorio?.total || 0}
          active={tab === 'notas'}
          onClick={() => setTab('notas')}
        />
      </div>

      {/* ── Conteúdo da aba ── */}
      <div style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderTop: 'none',
        borderRadius: '0 var(--radius) var(--radius) var(--radius)',
        padding: '14px 16px',
        minHeight: 240,
        position: 'relative',
        zIndex: 1,
      }}>

        {/* Barra de status estilo Explorer */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: 'var(--text-3)',
          marginBottom: 14, paddingBottom: 10,
          borderBottom: '1px solid var(--border-soft)',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
          <span style={{ color: 'var(--text-3)' }}>NFSE</span>
          <span>›</span>
          <span style={{ color: 'var(--text-2)' }}>{clientName(proc.cert_alias)}</span>
          <span>›</span>
          <span style={{ color: 'var(--text)' }}>
            {{ pdfs: 'pdf', xmls: 'xml', planilhas: 'planilhas', notas: 'notas' }[tab]}
          </span>
          <span style={{ marginLeft: 'auto' }}>
            {{ pdfs: pdfs?.length, xmls: xmls?.length, planilhas: planilhas?.length, notas: relatorio?.total }[tab] || 0} itens
          </span>
        </div>

        {/* Pasta PDFs */}
        {tab === 'pdfs' && (
          <div>
            {!pdfs?.length
              ? <p style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', padding: '40px 0' }}>
                  <IconPastaPDF size={32} /><br/>
                  <span style={{ display: 'block', marginTop: 8 }}>Pasta vazia</span>
                </p>
              : pdfs.map(f => <FileRow key={f.id} file={f} baseUrl={baseUrl} toast={toast} />)
            }
          </div>
        )}

        {/* Pasta XMLs */}
        {tab === 'xmls' && (
          <div>
            {!xmls?.length
              ? <p style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', padding: '40px 0' }}>
                  <IconPastaXML size={32} /><br/>
                  <span style={{ display: 'block', marginTop: 8 }}>Pasta vazia</span>
                </p>
              : xmls.map(f => <FileRow key={f.id} file={f} baseUrl={baseUrl} toast={toast} />)
            }
          </div>
        )}

        {/* Pasta Planilhas */}
        {tab === 'planilhas' && (
          <div>
            {!planilhas?.length
              ? <p style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', padding: '40px 0' }}>
                  <IconPastaPlanilha size={32} /><br/>
                  <span style={{ display: 'block', marginTop: 8 }}>Pasta vazia</span>
                </p>
              : planilhas.map(f => <FileRow key={f.id} file={f} baseUrl={baseUrl} toast={toast} />)
            }
          </div>
        )}

        {/* Aba Notas */}
        {tab === 'notas' && (
          <div>
            {!relatorio?.items?.length
              ? <p style={{ color: 'var(--text-3)', fontSize: 12, textAlign: 'center', padding: '40px 0' }}>
                  <IconPastaNotas size={32} /><br/>
                  <span style={{ display: 'block', marginTop: 8 }}>Nenhuma nota registrada</span>
                </p>
              : (
                <div className="table-wrap" style={{ maxHeight: 340 }}>
                  <table>
                    <thead><tr>
                      <th>Prestador / Tomador</th>
                      <th>Competência</th>
                      <th>Município</th>
                      <th style={{ textAlign: 'right' }}>Valor Total</th>
                      <th>Status</th>
                    </tr></thead>
                    <tbody>
                      {relatorio.items.map((n, i) => (
                        <tr key={i}>
                          <td className="primary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {n.parte_exibicao_nome || n.razao_social || '—'}
                          </td>
                          <td className="mono">{n.competencia || '—'}</td>
                          <td style={{ fontSize: 12 }}>{n.municipio || '—'}</td>
                          <td className="mono right">{fmtMoney(n.valor_total)}</td>
                          <td><StatusBadge value={n.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}
      </div>
    </Modal>
  );
}

function ProcessosPage({ baseUrl, toast }) {
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [busca, setBusca]                           = useState('');
  const [page, setPage]                             = useState(1);
  const [pageSize, setPageSize]                     = useState(10);
  const [statusFiltro, setStatusFiltro]             = useState('');
  const [selected, setSelected]                     = useState(null);
  const [loadingId, setLoadingId]                   = useState(null);

  const allProcs = useAsync(() => api(baseUrl, '/processos?page=1&page_size=500'), [baseUrl]);

  const procList = useAsync(() => {
    if (!empresaSelecionada) return Promise.resolve({ items: [], total: 0 });
    const q = new URLSearchParams({ page, page_size: pageSize, cert_alias: empresaSelecionada });
    if (statusFiltro) q.set('status', statusFiltro);
    return api(baseUrl, `/processos?${q}`);
  }, [baseUrl, empresaSelecionada, page, pageSize, statusFiltro]);

  // Agrupa por empresa com contadores
  const empresas = useMemo(() => {
    const items = allProcs.data?.items || [];
    const map = {};
    items.forEach(r => {
      const alias = r.cert_alias;
      const nome  = clientName(alias);
      if (!map[alias]) map[alias] = { alias, nome, total: 0, corretas: 0, divergentes: 0, running: 0, ultimaExec: null };
      map[alias].total++;
      map[alias].corretas    += r.total_corretas    || 0;
      map[alias].divergentes += r.total_divergentes || 0;
      if (r.status === 'running') map[alias].running++;
      const dt = r.end_date || r.start_date;
      if (dt && (!map[alias].ultimaExec || dt > map[alias].ultimaExec)) map[alias].ultimaExec = dt;
    });
    return Object.values(map).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [allProcs.data]);

  const empresasFiltradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return t ? empresas.filter(e => e.nome.toLowerCase().includes(t) || e.alias.toLowerCase().includes(t)) : empresas;
  }, [empresas, busca]);

  const detalhar = async (id) => {
    setLoadingId(id);
    try {
      const [proc, pdfs, xmls, planilhas, summary, relatorio] = await Promise.allSettled([
        api(baseUrl, `/processos/${id}`),
        api(baseUrl, `/processos/${id}/pdfs`),
        api(baseUrl, `/processos/${id}/xmls`),
        api(baseUrl, `/processos/${id}/planilhas`),
        api(baseUrl, `/processos/${id}/summary`),
        api(baseUrl, `/processos/${id}/relatorio?page=1&page_size=30`),
      ]);

      setSelected({
        proc:      proc.status      === 'fulfilled' ? proc.value      : null,
        pdfs:      pdfs.status      === 'fulfilled' ? pdfs.value      : [],
        xmls:      xmls.status      === 'fulfilled' ? xmls.value      : [],
        planilhas: planilhas.status === 'fulfilled' ? planilhas.value : [],
        summary:   summary.status   === 'fulfilled' ? summary.value   : null,
        relatorio: relatorio.status === 'fulfilled' ? relatorio.value : null,
      });
    } catch(e) { toast(e.message, 'error'); } finally { setLoadingId(null); }
  };

  const emp = empresaSelecionada ? empresas.find(e => e.alias === empresaSelecionada) : null;

  return (
    <div className="page-enter">
      <SectionHeader
        title={
          empresaSelecionada ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className="btn btn-ghost btn-xs"
                onClick={() => { setEmpresaSelecionada(null); setPage(1); setStatusFiltro(''); }}
                style={{ fontSize: 11 }}
              >← Empresas</button>
              {emp?.nome || clientName(empresaSelecionada)}
            </span>
          ) : 'Processos'
        }
        sub={
          empresaSelecionada
            ? `Processos de ${emp?.nome || empresaSelecionada} — clique em "Detalhes" para ver os arquivos`
            : 'Selecione uma empresa para ver seus processos e acessar os arquivos'
        }
        actions={
          <button className="btn btn-ghost btn-sm" onClick={() => { allProcs.reload(); if (empresaSelecionada) procList.reload(); }}>
            <IconRefresh /> Atualizar
          </button>
        }
      />

      {/* ── Nível 1: Cards de empresas ── */}
      {!empresaSelecionada && (
        <>
          <div style={{ marginBottom: 16, maxWidth: 400 }}>
            <input className="input" placeholder="Buscar empresa..." value={busca}
              onChange={e => setBusca(e.target.value)} />
          </div>

          {allProcs.loading ? <Loading /> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
              {empresasFiltradas.length === 0
                ? <Empty msg="Nenhuma empresa encontrada" />
                : empresasFiltradas.map(e => (
                  <div
                    key={e.alias}
                    onClick={() => { setEmpresaSelecionada(e.alias); setPage(1); }}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '18px 20px',
                      cursor: 'pointer',
                      transition: 'border-color .15s, background .15s',
                    }}
                    onMouseEnter={ev => { ev.currentTarget.style.borderColor = 'var(--accent)'; ev.currentTarget.style.background = 'var(--surface-2)'; }}
                    onMouseLeave={ev => { ev.currentTarget.style.borderColor = 'var(--border)';  ev.currentTarget.style.background = 'var(--surface)'; }}
                  >
                    {/* Cabeçalho do card */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 3 }}>{e.nome}</div>
                        <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                          {e.alias.split(' - ')[0]}
                        </div>
                      </div>
                      {e.running > 0 && <Badge tone="info" style={{ flexShrink: 0 }}>rodando</Badge>}
                    </div>

                    {/* Métricas */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                      {[
                        { label: 'Processos', value: e.total,       color: 'var(--text)' },
                        { label: 'Corretas',  value: e.corretas,    color: 'var(--green)' },
                        { label: 'Diverg.',   value: e.divergentes, color: e.divergentes > 0 ? 'var(--amber)' : 'var(--text-3)' },
                      ].map(({ label, value, color }) => (
                        <div key={label} style={{
                          background: 'var(--surface-2)', borderRadius: 8,
                          padding: '8px 10px', textAlign: 'center',
                        }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Rodapé */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      {e.ultimaExec && (
                        <span style={{ fontSize: 11, color: 'var(--text-3)' }}>
                          Último: {fmtDateShort(e.ultimaExec)}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: 'var(--accent)', marginLeft: 'auto' }}>
                        Ver processos →
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}

      {/* ── Nível 2: Processos da empresa ── */}
      {empresaSelecionada && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <select className="select" style={{ width: 160 }} value={statusFiltro}
              onChange={e => { setStatusFiltro(e.target.value); setPage(1); }}>
              <option value="">Todos os status</option>
              <option value="queued">Queued</option>
              <option value="running">Running</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          {procList.loading ? <Loading /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(procList.data?.items || []).length === 0
                ? <Empty msg="Nenhum processo encontrado" />
                : (procList.data?.items || []).map(r => (
                  <div
                    key={r.id}
                    style={{
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '16px 20px',
                      display: 'flex', alignItems: 'center', gap: 16,
                    }}
                  >
                    {/* Status indicator */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                      background: { completed: 'var(--green)', running: 'var(--accent)', failed: 'var(--red)', queued: 'var(--text-3)' }[r.status] || 'var(--text-3)',
                      boxShadow: r.status === 'running' ? '0 0 8px var(--accent)' : 'none',
                    }} />

                    {/* Info do processo */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <StatusBadge value={r.status} />
                        <Badge tone="neutral">{r.tipo_nota}</Badge>
                        <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                          {fmtDateShort(r.start_date)} → {fmtDateShort(r.end_date)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 16 }}>
                        <span style={{ fontSize: 12, color: 'var(--text-2)' }}>
                          <span style={{ color: 'var(--text-3)' }}>Notas: </span>
                          <span style={{ fontFamily: 'var(--font-mono)' }}>{r.total_notas || 0}</span>
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--green)' }}>
                          ✓ {r.total_corretas || 0}
                        </span>
                        {r.total_divergentes > 0 && (
                          <span style={{ fontSize: 12, color: 'var(--amber)' }}>
                            ⚠ {r.total_divergentes}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* ID curto */}
                    <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', flexShrink: 0 }}>
                      {r.id.slice(0, 8)}
                    </span>

                    {/* Botão detalhes */}
                    <button
                      className="btn btn-sm"
                      disabled={loadingId === r.id}
                      onClick={() => detalhar(r.id)}
                      style={{ flexShrink: 0 }}
                    >
                      {loadingId === r.id ? <Spinner size={12} /> : <><IconFolder /> Abrir</>}
                    </button>
                  </div>
                ))
              }
            </div>
          )}

          <Pagination page={page} pageSize={pageSize} total={procList.data?.total || 0}
            onPage={setPage} onSize={s => { setPageSize(s); setPage(1); }} />
        </>
      )}

      {/* ── Modal de detalhes com pastas ── */}
      <ProcessoModal
        key={selected?.proc?.id || 'closed'}
        selected={selected}
        baseUrl={baseUrl}
        toast={toast}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}

// ── Page: NFS-e ──────────────────────────────────────────────
// Nível 1: empresas únicas com totais
// Nível 2: ao clicar na empresa, mostra todas as notas dela

function FilaDeTrabalhoPage({ baseUrl, toast, navigate, variant = 'a', sidebarVisible = true, onToggleSidebar = null }) {
  const isVariantB = variant === 'b';
  const queueRulesEnabled = false;
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState(null);
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [obsInterna, setObsInterna] = useState('');
  const [statusFila, setStatusFila] = useState('pendente');
  const [prioridadeFila, setPrioridadeFila] = useState('baixa');
  const [responsavelFila, setResponsavelFila] = useState('');
  const [savingObs, setSavingObs] = useState(false);
  const [savingRule, setSavingRule] = useState(false);
  const [reapplyingRules, setReapplyingRules] = useState(false);
  const [smartSearch, setSmartSearch] = useState('');
  const [ruleForm, setRuleForm] = useState({
    id: null,
    campo: 'descricao_servico',
    operador: 'contains',
    valor: '',
    responsavel: '',
    prioridade: 100,
    ativo: true,
  });
  const [filters, setFilters] = useState(getQueueDefaultFilters);

  const filaData = useAsync(() => {
    const q = new URLSearchParams({ page: '1', page_size: '500' });
    if (filters.status) q.set('status', filters.status);
    if (filters.empresa) q.set('cert_alias', filters.empresa);
    if (filters.data_tipo) q.set('data_tipo', filters.data_tipo);
    if (filters.data_inicio) q.set('data_inicio', filters.data_inicio);
    if (filters.data_fim) q.set('data_fim', filters.data_fim);
    return api(baseUrl, `/nfse?${q.toString()}`);
  }, [baseUrl, filters.status, filters.empresa, filters.data_tipo, filters.data_inicio, filters.data_fim]);
  const rulesData = { loading: false, error: null, data: [], reload: () => {} };

  const queueItems = useMemo(() => {
    return (filaData.data?.items || []).map(mapQueueItem);
  }, [filaData.data]);

  const filterOptions = useMemo(() => {
    const uniq = arr => [...new Set(arr.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
    return {
      empresas: uniq(queueItems.map(item => item.queue_empresa_alias)),
      responsaveis: uniq(queueItems.map(item => item.queue_responsavel)),
    };
  }, [queueItems]);

  const filteredItems = queueItems.filter(item => {
    if (filters.prioridade && normFilterValue(item.queue_prioridade) !== normFilterValue(filters.prioridade)) return false;
    if (filters.responsavel && normFilterValue(item.queue_responsavel) !== normFilterValue(filters.responsavel)) return false;
    if (!matchQueueSmartSearch(item, smartSearch)) return false;
    return true;
  });
  const queueCounts = useMemo(() => ({
    total: filteredItems.length,
    alta: filteredItems.filter(item => item.queue_prioridade === 'alta').length,
    critica: filteredItems.filter(item => item.queue_sla.tone === 'danger').length,
    divergentes: filteredItems.filter(item => item.queue_status === 'divergente').length,
  }), [filteredItems]);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    if (page > totalPages) setPage(1);
  }, [filteredItems.length, page, pageSize]);

  useEffect(() => {
    setObsInterna(selected?.observacao_interna || '');
    setStatusFila(selected?.status_fila_manual || selected?.queue_status || 'pendente');
    setPrioridadeFila(normalizeQueuePriority(selected?.prioridade_manual || selected?.queue_prioridade || 'baixa'));
    setResponsavelFila(selected?.responsavel || '');
  }, [selected]);

  const setFilter = (key, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const restoreYesterdayFilters = () => {
    const defaults = getQueueDefaultFilters();
    setPage(1);
    setFilters(prev => ({
      ...prev,
      data_tipo: defaults.data_tipo,
      data_inicio: defaults.data_inicio,
      data_fim: defaults.data_fim,
    }));
  };

  const tributosComparativo = useMemo(() => {
    return selected ? buildQueueTributosComparativo(selected) : [];
  }, [selected]);

  const alertMeta = useMemo(() => {
    return selected ? getQueueAlertMeta(selected) : null;
  }, [selected]);

  const resetRuleForm = () => setRuleForm({
    id: null,
    campo: 'descricao_servico',
    operador: 'contains',
    valor: '',
    responsavel: '',
    prioridade: 100,
    ativo: true,
  });

  const exportQueueRows = useMemo(() => {
    return filteredItems.map(item => ({
      'N° da nota': item.queue_numero_nota,
      'Competência': item.queue_competencia,
      'Empresa': item.queue_empresa,
      'Prestador': item.queue_prestador,
      'Valor': item.valor_total === null || item.valor_total === undefined ? '\u2014' : fmtMoney(item.valor_total),
      'Simples Nacional / XML': item.simples_nacional || '\u2014',
      'Consulta Simples API': item.consulta_simples_api || '\u2014',
      'Status Simples Nacional': item.status_simples_nacional || '\u2014',
      'Status': item.queue_status,
      'Divergência': item.queue_divergencia,
      'Prioridade': normalizeQueuePriority(item.queue_prioridade) === 'alta' ? 'Alta' : normalizeQueuePriority(item.queue_prioridade) === 'media' ? 'Média' : 'Baixa',
      'Responsável': item.queue_responsavel,
      'Entrada': fmtDate(item.queue_entrada),
      'SLA': item.queue_sla?.label || '—',
    }));
  }, [filteredItems]);

  const exportQueueDetailedRows = useMemo(() => {
    return filteredItems.map(item => ({
      ...item,
      competencia: item.queue_competencia === '—' ? (item.competencia || '') : item.queue_competencia,
    }));
  }, [filteredItems]);

  const salvarObservacao = async () => {
    if (!selected) return;
    setSavingObs(true);
    try {
      await api(baseUrl, `/nfse/${selected.id}`, {
        method: 'PUT',
        body: {
          observacao_interna: obsInterna,
          status_fila_manual: statusFila,
          prioridade_manual: prioridadeFila,
          responsavel: responsavelFila,
        },
      });
      setSelected(prev => prev ? {
        ...prev,
        observacao_interna: obsInterna,
        status_fila_manual: statusFila,
        status_fila: statusFila,
        prioridade_manual: prioridadeFila,
        responsavel: responsavelFila,
        queue_status: normalizeQueueStatus(statusFila),
        queue_prioridade: normalizeQueuePriority(prioridadeFila),
        queue_responsavel: responsavelFila || 'Não atribuído',
        queue_sla: queueSlaFromDate(prev.queue_entrada, prioridadeFila),
        updated_at: new Date().toISOString(),
      } : prev);
      toast('Análise interna salva com sucesso.', 'success');
      filaData.reload();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setSavingObs(false);
    }
  };

  const salvarRegra = async e => {
    e.preventDefault();
    toast('Regras de atribuição não estão disponíveis neste backend publicado.', 'error');
  };

  const editarRegra = regra => {
    setRuleForm({
      id: regra.id,
      campo: regra.campo,
      operador: regra.operador,
      valor: regra.valor,
      responsavel: regra.responsavel,
      prioridade: regra.prioridade,
      ativo: !!regra.ativo,
    });
    setRulesModalOpen(true);
  };

  const alternarRegra = async regra => {
    toast('Regras de atribuição não estão disponíveis neste backend publicado.', 'error');
  };

  const excluirRegra = async regra => {
    if (!window.confirm(`Excluir a regra "${regra.valor}"?`)) return;
    toast('Regras de atribuição não estão disponíveis neste backend publicado.', 'error');
  };

  const reaplicarRegras = async () => {
    setReapplyingRules(true);
    toast('Regras de atribuição não estão disponíveis neste backend publicado.', 'error');
    setReapplyingRules(false);
  };

  return (
    <div className={cn('page-enter', isVariantB && 'queue-page-b')}>
      <SectionHeader
        title={isVariantB ? 'Fila de Trabalho B' : 'Fila de Trabalho'}
        sub={isVariantB ? 'Variante B da visao operacional das notas em analise no portal' : 'Visao operacional das notas em analise no portal'}
        actions={
          <>
            {onToggleSidebar ? (
              <button
                className="btn btn-ghost btn-sm"
                onClick={onToggleSidebar}
              >
                {sidebarVisible ? 'Ocultar menu' : 'Mostrar menu'}
              </button>
            ) : null}
            {navigate ? (
              <>
                <button
                  className={cn('btn btn-sm', !isVariantB ? 'btn-primary' : 'btn-ghost')}
                  onClick={() => navigate('fila_trabalho')}
                >
                  Fila A
                </button>
                <button
                  className={cn('btn btn-sm', isVariantB ? 'btn-primary' : 'btn-ghost')}
                  onClick={() => navigate('fila_trabalho_b')}
                >
                  Fila B
                </button>
              </>
            ) : null}
            {queueRulesEnabled ? (
              <>
                <button className="btn btn-ghost btn-sm" onClick={() => setRulesModalOpen(true)}>
                  <IconSettings /> Regras
                </button>
                <button className="btn btn-ghost btn-sm" disabled={reapplyingRules} onClick={reaplicarRegras}>
                  {reapplyingRules ? <Spinner size={12} /> : <><IconRefresh /> Reaplicar regras</>}
                </button>
              </>
            ) : null}
            <button
              className="btn btn-ghost btn-sm"
              disabled={!filteredItems.length}
              onClick={() => dlCSV(exportQueueRows, `${isVariantB ? 'fila_trabalho_b' : 'fila_trabalho'}_${today()}.csv`)}
            >
              <IconDown /> Exportar fila
            </button>
            <button
              className="btn btn-ghost btn-sm"
              disabled={!filteredItems.length}
              onClick={() => exportRelatorioCSV(exportQueueDetailedRows, `${isVariantB ? 'fila_trabalho_b_detalhado' : 'fila_trabalho_detalhado'}_${today()}.csv`)}
            >
              <IconDown /> Exportar detalhado
            </button>
            <button className="btn btn-ghost btn-sm" onClick={filaData.reload}>
              <IconRefresh /> Atualizar
            </button>
          </>
        }
      />

      {isVariantB ? (
        <div className="queue-b-summary">
          <div className="queue-b-summary-title">Visão operacional da fila</div>
          <div className="queue-b-summary-metrics">
            <span>{queueCounts.total} notas</span>
            <span className="is-alert">{queueCounts.divergentes} divergentes</span>
            <span className="is-warn">{queueCounts.alta} alta prioridade</span>
            <span>{queueCounts.critica} SLA crítico</span>
          </div>
        </div>
      ) : null}

      <div className="queue-grid">
        {!isVariantB ? (
          <div className="card">
            <div className="card-body queue-toolbar">
              <div className="empresa-card-metric">
                <div className="stat-label">Notas na fila</div>
                <div className="stat-value" style={{ fontSize: 22 }}>{queueCounts.total}</div>
              </div>
              <div className="empresa-card-metric">
                <div className="stat-label">Alta prioridade</div>
                <div className="stat-value" style={{ fontSize: 22, color: 'var(--red)' }}>{queueCounts.alta}</div>
              </div>
              <div className="empresa-card-metric">
                <div className="stat-label">SLA crítico</div>
                <div className="stat-value" style={{ fontSize: 22, color: 'var(--amber)' }}>{queueCounts.critica}</div>
              </div>
            </div>
          </div>
        ) : null}

        <FilterBar label={isVariantB ? 'Filtros operacionais' : 'Filtros da fila'} defaultOpen={false}>
          <div className="form-grid form-cols-4" style={{ marginTop: 16 }} onClick={e => e.stopPropagation()}>
            <div className="field">
              <label className="label">Status</label>
              <select className="select" value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                <option value="">Todos</option>
                <option value="divergente">Divergente</option>
                <option value="correta">Correta</option>
                <option value="pendente">Pendente</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Empresa</label>
              <select className="select" value={filters.empresa} onChange={e => setFilter('empresa', e.target.value)}>
                <option value="">Todas</option>
                {filterOptions.empresas.map(alias => (
                  <option key={alias} value={alias}>{clientName(alias)}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Prioridade</label>
              <select className="select" value={filters.prioridade} onChange={e => setFilter('prioridade', e.target.value)}>
                <option value="">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Responsável</label>
              <select className="select" value={filters.responsavel} onChange={e => setFilter('responsavel', e.target.value)}>
                <option value="">Todos</option>
                {filterOptions.responsaveis.map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label">Filtrar por</label>
              <select className="select" value={filters.data_tipo} onChange={e => setFilter('data_tipo', e.target.value)}>
                <option value="entrada">Entrada</option>
                <option value="emissao">Emissão</option>
              </select>
            </div>
            <div className="field">
              <label className="label">Data inicial</label>
              <input className="input" type="date" value={filters.data_inicio} onChange={e => setFilter('data_inicio', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Data final</label>
              <input className="input" type="date" value={filters.data_fim} onChange={e => setFilter('data_fim', e.target.value)} />
            </div>
            <div className="field queue-search-field">
              <label className="label">Busca inteligente</label>
              <input
                className="input"
                value={smartSearch}
                onChange={e => { setPage(1); setSmartSearch(e.target.value); }}
                placeholder="Busque em todas as colunas ou use competencia:, empresa:, status:, prioridade:, responsavel:, nota:, prestador:, valor:, entrada:, sla:"
              />
            </div>
            <div className="field queue-search-field">
              <div className="queue-filter-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={restoreYesterdayFilters}>
                  Voltar para ontem
                </button>
                <span className="queue-filter-hint">
                  Data padrão: entrada em {filters.data_inicio || '—'} até {filters.data_fim || '—'}.
                </span>
              </div>
            </div>
          </div>
        </FilterBar>

        {filaData.error && <Alert type="error">{filaData.error}</Alert>}

        <div className="card">
          <div className="card-header">
            <span className="card-title">Fila operacional</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {filaData.loading ? (
              <div style={{ padding: 24 }}><Loading label="Carregando fila..." /></div>
            ) : (
              <div className="table-wrap scrollable queue-table" style={{ border: 'none', borderRadius: 0 }}>
                <table>
                  <thead>
                    <tr>
                      <th>N° da nota</th>
                      <th>Competência</th>
                      <th>Empresa</th>
                      <th>Prestador</th>
                      <th>Valor</th>
                      <th>Simples Nacional / XML</th>
                      <th>Consulta Simples API</th>
                      <th>Status Simples Nacional</th>
                      <th>Status</th>
                      <th>Divergência</th>
                      <th>Prioridade</th>
                      <th>Responsável</th>
                      <th>Entrada</th>
                      <th>SLA</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {!paginatedItems.length ? (
                      <Empty msg="Nenhuma nota encontrada para os filtros atuais." />
                    ) : paginatedItems.map(item => (
                      <tr
                        key={item.id}
                        className={item.queue_sla.tone === 'danger' ? 'queue-row-attention' : ''}
                        onClick={() => setSelected(item)}
                      >
                        <td className="primary mono">{item.queue_numero_nota}</td>
                        <td className="mono">{item.queue_competencia}</td>
                        <td>{item.queue_empresa}</td>
                        <td style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={item.queue_prestador}>
                          {item.queue_prestador}
                        </td>
                        <td className="mono right">{fmtMoney(item.valor_total)}</td>
                        <td>{item.simples_nacional || '\u2014'}</td>
                        <td>{item.consulta_simples_api || '\u2014'}</td>
                        <td>{item.status_simples_nacional || '\u2014'}</td>
                        <td><StatusBadge value={item.queue_status} /></td>
                        <td>
                          <Badge tone={item.queue_divergencia_final ? 'warn' : 'success'}>
                            {item.queue_divergencia}
                          </Badge>
                        </td>
                        <td><QueuePriorityBadge value={item.queue_prioridade} /></td>
                        <td>{item.queue_responsavel}</td>
                        <td className="mono">{fmtDate(item.queue_entrada)}</td>
                        <td><QueueSlaBadge sla={item.queue_sla} /></td>
                        <td className="actions">
                          <button
                            className="btn btn-primary btn-xs"
                            onClick={e => { e.stopPropagation(); setSelected(item); }}
                          >
                            Analisar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <Pagination
          page={page}
          pageSize={pageSize}
          total={filteredItems.length}
          onPage={setPage}
          onSize={s => { setPageSize(s); setPage(1); }}
        />
      </div>

      <Modal open={rulesModalOpen && queueRulesEnabled} title="Regras de atribuição automática" onClose={() => { setRulesModalOpen(false); resetRuleForm(); }} wide>
        <div className="queue-detail">
          <Alert type="info">
            Use regras simples para preencher o responsável automaticamente. Regra manual na nota continua prevalecendo. Exemplos:
            <strong> descrição do serviço contém "COMISSÃO" → Yasmin</strong> ou <strong>fornecedor contém "Planning" → Rejane</strong>.
          </Alert>

          <div className="queue-detail-grid">
            <div className="queue-detail-block">
              <div className="card-title" style={{ marginBottom: 12 }}>{ruleForm.id ? 'Editar regra' : 'Nova regra'}</div>
              <form onSubmit={salvarRegra}>
                <div className="form-grid form-cols-2">
                  <div className="field">
                    <label className="label">Campo</label>
                    <select className="select" value={ruleForm.campo} onChange={e => setRuleForm(f => ({ ...f, campo: e.target.value }))}>
                      <option value="descricao_servico">Descrição do serviço</option>
                      <option value="fornecedor">Fornecedor</option>
                      <option value="cert_alias">Empresa/alias</option>
                      <option value="codigo_servico">Código do serviço</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="label">Operador</label>
                    <select className="select" value={ruleForm.operador} onChange={e => setRuleForm(f => ({ ...f, operador: e.target.value }))}>
                      <option value="contains">Contém</option>
                      <option value="equals">Igual a</option>
                      <option value="starts_with">Começa com</option>
                    </select>
                  </div>
                  <div className="field">
                    <label className="label">Valor da regra</label>
                    <input className="input" value={ruleForm.valor} onChange={e => setRuleForm(f => ({ ...f, valor: e.target.value }))} placeholder="Ex.: COMISSÃO, CORRETAGEM, Planning" required />
                  </div>
                  <div className="field">
                    <label className="label">Responsável</label>
                    <input className="input" value={ruleForm.responsavel} onChange={e => setRuleForm(f => ({ ...f, responsavel: e.target.value }))} placeholder="Ex.: Yasmin" required />
                  </div>
                  <div className="field">
                    <label className="label">Prioridade</label>
                    <input className="input" type="number" min="1" value={ruleForm.prioridade} onChange={e => setRuleForm(f => ({ ...f, prioridade: e.target.value }))} />
                  </div>
                  <div className="field" style={{ display: 'flex', alignItems: 'end' }}>
                    <label className="checkbox-inline">
                      <input type="checkbox" checked={!!ruleForm.ativo} onChange={e => setRuleForm(f => ({ ...f, ativo: e.target.checked }))} />
                      <span>Regra ativa</span>
                    </label>
                  </div>
                </div>
                <div className="queue-detail-actions">
                  {ruleForm.id ? <button type="button" className="btn btn-ghost btn-sm" onClick={resetRuleForm}>Cancelar edição</button> : null}
                  <button className="btn btn-primary btn-sm" disabled={savingRule}>
                    {savingRule ? <Spinner size={13} /> : ruleForm.id ? 'Atualizar regra' : 'Salvar regra'}
                  </button>
                </div>
              </form>
            </div>

            <div className="queue-detail-block">
              <div className="card-title" style={{ marginBottom: 12 }}>Regras cadastradas</div>
              {rulesData.loading ? <Loading label="Carregando regras..." /> : rulesData.error ? <Alert type="error">{rulesData.error}</Alert> : (
                <div className="table-wrap scrollable" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Campo</th>
                        <th>Operador</th>
                        <th>Valor</th>
                        <th>Responsável</th>
                        <th>Prioridade</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {!(rulesData.data || []).length ? (
                        <Empty msg="Nenhuma regra cadastrada." />
                      ) : (rulesData.data || []).map(regra => (
                        <tr key={regra.id}>
                          <td>{regra.campo}</td>
                          <td>{regra.operador}</td>
                          <td>{regra.valor}</td>
                          <td>{regra.responsavel}</td>
                          <td className="mono">{regra.prioridade}</td>
                          <td><Badge tone={regra.ativo ? 'success' : 'neutral'}>{regra.ativo ? 'Ativa' : 'Inativa'}</Badge></td>
                          <td className="actions">
                            <button className="btn btn-ghost btn-xs" onClick={() => editarRegra(regra)}><IconEdit /></button>
                            <button className="btn btn-ghost btn-xs" onClick={() => alternarRegra(regra)}>{regra.ativo ? 'Desativar' : 'Ativar'}</button>
                            <button className="btn btn-danger btn-xs" onClick={() => excluirRegra(regra)}><IconTrash /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {isVariantB && selected ? (
        <>
          <div className="queue-drawer-backdrop" onClick={() => setSelected(null)} />
          <aside className="queue-drawer">
            <div className="queue-drawer-header">
              <div>
                <div className="queue-drawer-title">Analisar nota</div>
                <div className="queue-drawer-sub">{selected.queue_numero_nota}</div>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}><IconX /></button>
            </div>
            <div className="queue-drawer-body">
              <QueueAnalysisContent
                selected={selected}
                alertMeta={alertMeta}
                tributosComparativo={tributosComparativo}
                baseUrl={baseUrl}
                toast={toast}
                statusFila={statusFila}
                setStatusFila={setStatusFila}
                prioridadeFila={prioridadeFila}
                setPrioridadeFila={setPrioridadeFila}
                responsavelFila={responsavelFila}
                setResponsavelFila={setResponsavelFila}
                obsInterna={obsInterna}
                setObsInterna={setObsInterna}
                salvarObservacao={salvarObservacao}
                savingObs={savingObs}
              />
            </div>
          </aside>
        </>
      ) : null}

      <Modal open={!isVariantB && !!selected} title={selected ? `Analisar nota - ${selected.queue_numero_nota}` : 'Analisar nota'} onClose={() => setSelected(null)} wide>
        <QueueAnalysisContent
          selected={selected}
          alertMeta={alertMeta}
          tributosComparativo={tributosComparativo}
          baseUrl={baseUrl}
          toast={toast}
          statusFila={statusFila}
          setStatusFila={setStatusFila}
          prioridadeFila={prioridadeFila}
          setPrioridadeFila={setPrioridadeFila}
          responsavelFila={responsavelFila}
          setResponsavelFila={setResponsavelFila}
          obsInterna={obsInterna}
          setObsInterna={setObsInterna}
          salvarObservacao={salvarObservacao}
          savingObs={savingObs}
        />
      </Modal>
    </div>
  );
}

function NFSePage({ baseUrl, toast }) {
  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [busca, setBusca] = useState('');
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState({
    status: '', municipio: '', cnpj_cpf: '',
    competencia: '', codigo_servico: '', somente_divergentes: false,
  });

  // Busca resumida de todas as notas para montar o painel de empresas
  const allNfse = useAsync(() => api(baseUrl, '/nfse?page=1&page_size=500'), [baseUrl]);

  // Notas da empresa selecionada
  const nfseList = useAsync(() => {
    if (!empresaSelecionada) return Promise.resolve({ items: [], total: 0 });
    const q = new URLSearchParams({ page, page_size: pageSize, cert_alias: empresaSelecionada });
    Object.entries(filters).forEach(([k, v]) => { if (v !== '' && v !== false) q.set(k, String(v)); });
    return api(baseUrl, `/nfse?${q}`);
  }, [baseUrl, empresaSelecionada, page, pageSize, JSON.stringify(filters)]);

  // Agrupa por cert_alias
  const empresas = useMemo(() => {
    const items = allNfse.data?.items || [];
    const map = {};
    items.forEach(r => {
      const alias = r.certificado || r.cert_alias || '';
      if (!alias) return;
      if (!map[alias]) map[alias] = { alias, nome: clientName(alias), total: 0, divergentes: 0, valorTotal: 0 };
      map[alias].total++;
      if (String(r.status || '').toLowerCase().includes('diverg')) map[alias].divergentes++;
      map[alias].valorTotal += Number(r.valor_total) || 0;
    });
    return Object.values(map).sort((a, b) => a.nome.localeCompare(b.nome));
  }, [allNfse.data]);

  const empresasFiltradas = useMemo(() => {
    const t = busca.trim().toLowerCase();
    return t ? empresas.filter(e => e.nome.toLowerCase().includes(t) || e.alias.toLowerCase().includes(t)) : empresas;
  }, [empresas, busca]);

  const emp = empresaSelecionada ? empresas.find(e => e.alias === empresaSelecionada) : null;
  const sf = (k, v) => { setPage(1); setFilters(f => ({ ...f, [k]: v })); };

  const filterFields = [
    { k: 'status',         l: 'Status' },
    { k: 'municipio',      l: 'Município' },
    { k: 'cnpj_cpf',       l: 'CPF/CNPJ' },
    { k: 'competencia',    l: 'Competência (AAAA-MM)' },
    { k: 'codigo_servico', l: 'Código do serviço' },
  ];

  return (
    <div className="page-enter">
      <SectionHeader
        title={empresaSelecionada ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="btn btn-ghost btn-xs" onClick={() => { setEmpresaSelecionada(null); setPage(1); setFilters({ status: '', municipio: '', cnpj_cpf: '', competencia: '', codigo_servico: '', somente_divergentes: false }); }}
              style={{ fontSize: 11 }}>← Empresas</button>
            {emp?.nome || clientName(empresaSelecionada)}
          </span>
        ) : 'NFS-e'}
        sub={empresaSelecionada
          ? `Notas fiscais de ${emp?.nome || empresaSelecionada}`
          : 'Selecione uma empresa para ver suas notas'}
        actions={empresaSelecionada && (
          <>
            <button className="btn btn-ghost btn-sm" disabled={!nfseList.data?.items?.length}
              onClick={() => dlCSV(nfseList.data.items, `nfse_${empresaSelecionada}.csv`)}>
              <IconDown /> CSV
            </button>
            <button className="btn btn-ghost btn-sm" onClick={nfseList.reload}><IconRefresh /></button>
          </>
        )}
      />

      {/* ── Nível 1: Lista de empresas ── */}
      {!empresaSelecionada && (
        <>
          <div style={{ marginBottom: 16, maxWidth: 400 }}>
            <input className="input" placeholder="Buscar empresa..." value={busca}
              onChange={e => setBusca(e.target.value)} />
          </div>

          {allNfse.loading ? <Loading /> : (
            <div className="card">
              <div className="card-body" style={{ padding: 0 }}>
                <div className="table-wrap scrollable" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead><tr>
                      <th>Empresa</th><th>Total notas</th>
                      <th>Divergentes</th><th>Valor total</th><th></th>
                    </tr></thead>
                    <tbody>
                      {empresasFiltradas.length === 0
                        ? <Empty msg="Nenhuma nota encontrada" />
                        : empresasFiltradas.map(e => (
                          <tr key={e.alias} style={{ cursor: 'pointer' }}
                            onClick={() => { setEmpresaSelecionada(e.alias); setPage(1); }}>
                            <td className="primary">{e.nome}</td>
                            <td className="mono">{e.total}</td>
                            <td>
                              {e.divergentes > 0
                                ? <Badge tone="warn">{e.divergentes} divergentes</Badge>
                                : <span style={{ color: 'var(--text-3)' }}>—</span>}
                            </td>
                            <td className="mono right">{fmtMoney(e.valorTotal)}</td>
                            <td className="actions">
                              <span style={{ fontSize: 11, color: 'var(--accent)' }}>Ver notas →</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Nível 2: Notas da empresa ── */}
      {empresaSelecionada && (
        <>
          <FilterBar>
            <div className="form-grid form-cols-3" style={{ marginTop: 16 }}>
              {filterFields.map(({ k, l }) => (
                <div key={k} className="field">
                  <label className="label">{l}</label>
                  <input className="input" placeholder={l} value={filters[k]}
                    onChange={e => sf(k, e.target.value)} />
                </div>
              ))}
              <div className="field" style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
                <label className="check-label">
                  <input type="checkbox" checked={filters.somente_divergentes}
                    onChange={e => sf('somente_divergentes', e.target.checked)} />
                  Somente divergentes
                </label>
              </div>
            </div>
          </FilterBar>

          {nfseList.error && <Alert type="error">{nfseList.error}</Alert>}

          <div className="card">
            <div className="card-body" style={{ padding: 0 }}>
              {nfseList.loading ? <div style={{ padding: 24 }}><Loading /></div> : (
                <div className="table-wrap scrollable" style={{ border: 'none', borderRadius: 0 }}>
                  <table>
                    <thead><tr>
                      <th>Empresa (prestador/tomador)</th><th>Tipo</th><th>Competência</th>
                      <th>Município</th><th>Documento</th>
                      <th>Valor Total</th><th>Vlr. Líquido</th><th>Status</th>
                    </tr></thead>
                    <tbody>
                      {(nfseList.data?.items || []).length === 0
                        ? <Empty msg="Nenhuma nota encontrada" />
                        : (nfseList.data?.items || []).map((r, i) => (
                          <tr key={r.chave_acesso || i}
                            style={String(r.status || '').toLowerCase().includes('diverg')
                              ? { background: 'rgba(245,166,35,.04)' } : {}}>
                            <td className="primary" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                              title={r.razao_social}>{r.razao_social}</td>
                            <td><Badge tone="neutral">{r.tipo_nota}</Badge></td>
                            <td className="mono">{r.competencia}</td>
                            <td>{r.municipio}</td>
                            <td className="mono">{r.cnpj_cpf}</td>
                            <td className="mono right">{fmtMoney(r.valor_total)}</td>
                            <td className="mono right">{fmtMoney(r.valor_liquido)}</td>
                            <td><StatusBadge value={r.status} /></td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <Pagination page={page} pageSize={pageSize} total={nfseList.data?.total || 0}
            onPage={setPage} onSize={s => { setPageSize(s); setPage(1); }} />
        </>
      )}
    </div>
  );
}

// ── Page: Relatório Interativo ───────────────────────────────
function RelatorioPage({ baseUrl, toast }) {
  const [processoId, setProcessoId] = useState('');
  const [page, setPage]       = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [filters, setFilters] = useState({
    status: '', municipio: '', competencia: '', cnpj_cpf: '', codigo_servico: '', somente_divergentes: false, busca: '',
  });
  const [data, setData]   = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [edits, setEdits] = useState({});
  const [saving, setSaving] = useState({});

  const load = async () => {
    if (!processoId.trim()) return;
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, page_size: pageSize });
      ['status', 'municipio', 'competencia', 'cnpj_cpf', 'codigo_servico'].forEach(k => { if (filters[k]) q.set(k, filters[k]); });
      if (filters.somente_divergentes) q.set('somente_divergentes', 'true');
      const d = await api(baseUrl, `/processos/${processoId.trim()}/relatorio?${q}`);
      setData(d); setEdits({});
    } catch (e) { toast(e.message, 'error'); } finally { setLoading(false); }
  };

  useEffect(() => { if (processoId.trim()) load(); }, [page, pageSize]);

  const rows = useMemo(() => {
    const term = filters.busca.trim().toLowerCase();
    const items = data.items || [];
    const filtered = term ? items.filter(r => Object.values(r).some(v => String(v ?? '').toLowerCase().includes(term))) : items;
    return filtered.map((r, i) => ({ ...r, ...(edits[i] || {}) }));
  }, [data.items, filters.busca, edits]);

  const setEdit = (idx, k, v) => setEdits(p => ({ ...p, [idx]: { ...(p[idx] || {}), [k]: v } }));

  const salvar = async (idx, row) => {
    setSaving(p => ({ ...p, [idx]: true }));
    try {
      await api(baseUrl, `/nfse/${row.id}`, { method: 'PUT', body: {
        valor_liquido_correto: Number(row.valor_liquido_correto) || null,
        alertas_fiscais: row.alertas_fiscais || null,
      }});
      toast('Nota salva com sucesso.', 'success');
    } catch (e) { toast(e.message, 'error'); } finally { setSaving(p => ({ ...p, [idx]: false })); }
  };

  const summary = useMemo(() => ({
    total: rows.length,
    divergentes: rows.filter(r => String(r.status || '').toLowerCase().includes('diverg')).length,
    valorTotal: rows.reduce((s, r) => s + (Number(r.valor_total) || 0), 0),
    valorLiquido: rows.reduce((s, r) => s + (Number(r.valor_liquido) || 0), 0),
  }), [rows]);

  const sf = (k, v) => setFilters(f => ({ ...f, [k]: v }));

  const READONLY_COLS = [
    { k: 'razao_social',  l: 'Empresa',        w: 160 },
    { k: 'competencia',   l: 'Competência',     w: 100 },
    { k: 'municipio',     l: 'Município',       w: 120 },
    { k: 'cnpj_cpf',      l: 'Documento',       w: 130, mono: true },
    { k: 'valor_total',   l: 'Valor Total',     w: 110, money: true },
    { k: 'valor_liquido', l: 'Vlr. Líquido',    w: 110, money: true },
    { k: 'status',        l: 'Status',          w: 100, badge: true },
  ];

  const EDIT_COLS = [
    { k: 'valor_liquido_correto', l: 'Vlr. Líq. Correto', w: 130 },
    { k: 'alertas_fiscais',       l: 'Alertas / Obs.',    w: 180 },
  ];

  return (
    <div className="page-enter">
      <SectionHeader
        title="Relatório Interativo"
        sub="Edição e exportação de dados de auditoria"
        actions={
          <>
            <button className="btn btn-ghost btn-sm" disabled={!rows.length}
              onClick={() => exportRelatorioCSV(rows, `relatorio_${processoId || 'nfse'}.csv`)}>
              <IconDown /> Exportar CSV/Excel
            </button>
          </>
        }
      />

      {/* KPIs */}
      <div className="stat-grid" style={{ marginBottom: 20 }}>
        <div className="stat-card neutral">
          <div className="stat-label">Linhas visíveis</div>
          <div className="stat-value">{summary.total}</div>
        </div>
        <div className={cn('stat-card', summary.divergentes > 0 ? 'warn' : 'success')}>
          <div className="stat-label">Divergentes</div>
          <div className="stat-value">{summary.divergentes}</div>
        </div>
        <div className="stat-card info">
          <div className="stat-label">Valor total</div>
          <div className="stat-value money">{fmtMoney(summary.valorTotal)}</div>
        </div>
        <div className="stat-card success">
          <div className="stat-label">Valor líquido</div>
          <div className="stat-value money">{fmtMoney(summary.valorLiquido)}</div>
        </div>
      </div>

      {/* Filtros */}
      <FilterBar>
        <div className="form-grid form-cols-3" style={{ marginTop: 16 }}>
          <div className="field">
            <label className="label">Processo ID</label>
            <input className="input" placeholder="ID do processo" value={processoId}
              onChange={e => setProcessoId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && load()} />
          </div>
          {[
            { k: 'status',         l: 'Status' },
            { k: 'municipio',      l: 'Município' },
            { k: 'competencia',    l: 'Competência' },
            { k: 'cnpj_cpf',       l: 'CPF/CNPJ' },
            { k: 'codigo_servico', l: 'Código serviço' },
            { k: 'busca',          l: 'Busca livre' },
          ].map(({ k, l }) => (
            <div key={k} className="field">
              <label className="label">{l}</label>
              <input className="input" placeholder={l} value={filters[k]} onChange={e => sf(k, e.target.value)} />
            </div>
          ))}
          <div className="field" style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
            <label className="check-label">
              <input type="checkbox" checked={filters.somente_divergentes}
                onChange={e => sf('somente_divergentes', e.target.checked)} />
              Somente divergentes
            </label>
          </div>
          <div className="field" style={{ justifyContent: 'flex-end', paddingTop: 20 }}>
            <button className="btn btn-primary btn-sm" onClick={() => { setPage(1); load(); }}>
              ▶ Carregar relatório
            </button>
          </div>
        </div>
      </FilterBar>

      {/* Tabela */}
      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {loading ? <div style={{ padding: 24 }}><Loading /></div> : rows.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)', fontSize: 13 }}>
              Informe um Processo ID e clique em Carregar relatório.
            </div>
          ) : (
            <div className="table-wrap scrollable" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead>
                  <tr>
                    {READONLY_COLS.map(c => <th key={c.k} style={{ minWidth: c.w }}>{c.l}</th>)}
                    {EDIT_COLS.map(c => (
                      <th key={c.k} style={{ minWidth: c.w, color: 'var(--accent)' }}>
                        ✏ {c.l}
                      </th>
                    ))}
                    <th style={{ minWidth: 70 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, idx) => (
                    <tr key={idx} style={String(row.status || '').toLowerCase().includes('diverg')
                      ? { background: 'rgba(245,166,35,.04)' } : {}}>
                      {READONLY_COLS.map(c => (
                        <td key={c.k} className={cn(c.mono && 'mono', c.money && 'right')}>
                          {c.badge ? <StatusBadge value={row[c.k]} />
                            : c.money ? fmtMoney(row[c.k])
                            : <span style={{ maxWidth: c.w, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                                title={String(row[c.k] ?? '')}>{row[c.k] ?? '—'}</span>}
                        </td>
                      ))}
                      {EDIT_COLS.map(c => (
                        <td key={c.k}>
                          <input
                            className="rel-input"
                            value={row[c.k] ?? ''}
                            onChange={e => setEdit(idx, c.k, e.target.value)}
                            placeholder="—"
                          />
                        </td>
                      ))}
                      <td className="actions">
                        <button className="btn btn-success btn-xs" disabled={saving[idx]} onClick={() => salvar(idx, row)}>
                          {saving[idx] ? <Spinner size={10} /> : <IconCheck />}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {rows.length > 0 && (
        <Pagination page={page} pageSize={pageSize} total={data.total || rows.length}
          onPage={setPage} onSize={s => { setPageSize(s); setPage(1); }} />
      )}
    </div>
  );
}

// ── Page: Certificados ───────────────────────────────────────
function CertificadosPage({ baseUrl, toast }) {
  const list = useAsync(() => api(baseUrl, '/certificados'), [baseUrl]);
  const [modal, setModal] = useState(null); // null | 'new' | 'edit' | 'pass'
  const [current, setCurrent] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ alias: '', client_name: '', password: '', file: null });
  const [passForm, setPassForm] = useState({ password: '', confirm: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submitNew = async e => {
    e.preventDefault();
    setFormError('');
    if (!String(form.alias || '').trim()) {
      const msg = 'Informe o alias do certificado.';
      setFormError(msg);
      toast(msg, 'error');
      return;
    }
    if (!String(form.password || '').trim()) {
      const msg = 'Informe a senha do certificado.';
      setFormError(msg);
      toast(msg, 'error');
      return;
    }
    if (!form.file) {
      const msg = 'Selecione o arquivo PFX antes de salvar.';
      setFormError(msg);
      toast(msg, 'error');
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      ['alias', 'client_name', 'password'].forEach(k => fd.append(k, form[k]));
      fd.append('file', form.file);
      const resp = await api(baseUrl, '/certificados', { method: 'POST', body: fd });
      if (resp && (resp.ok === false || resp.success === false || resp.error)) {
        throw new Error(resp.detail || resp.message || resp.error || 'Falha ao cadastrar certificado.');
      }
      toast('Certificado cadastrado.', 'success');
      setModal(null); setForm({ alias: '', client_name: '', password: '', file: null });
      list.reload();
    } catch (e) {
      const msg = e.message || 'Falha ao cadastrar certificado.';
      setFormError(msg);
      toast(msg, 'error');
    } finally { setSaving(false); }
  };

  const submitEdit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api(baseUrl, `/certificados/${current.alias}`, { method: 'PUT', body: { alias: form.alias, client_name: form.client_name } });
      toast('Certificado atualizado.', 'success');
      setModal(null); list.reload();
    } catch (e) { toast(e.message, 'error'); } finally { setSaving(false); }
  };

  const submitPass = async e => {
    e.preventDefault();
    if (passForm.password !== passForm.confirm) { toast('As senhas não coincidem.', 'error'); return; }
    setSaving(true);
    try {
      await api(baseUrl, `/certificados/${current.alias}/senha`, { method: 'PUT', body: { password: passForm.password } });
      toast('Senha redefinida.', 'success'); setModal(null);
    } catch (e) { toast(e.message, 'error'); } finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api(baseUrl, `/certificados/${confirm}`, { method: 'DELETE' });
      toast('Certificado excluído.', 'success'); setConfirm(null); list.reload();
    } catch (e) { toast(e.message, 'error'); setConfirm(null); }
  };

  return (
    <div className="page-enter">
      <SectionHeader title="Certificados" sub="Gestão de certificados digitais PFX"
        actions={<button className="btn btn-primary btn-sm" onClick={() => { setForm({ alias: '', client_name: '', password: '', file: null }); setFormError(''); setModal('new'); }}><IconPlus /> Novo certificado</button>}
      />

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {list.loading ? <div style={{ padding: 24 }}><Loading /></div> : (
            <div className="table-wrap scrollable" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr>
                  <th>Empresa</th><th>Alias</th><th>Arquivo</th><th>Status</th><th></th>
                </tr></thead>
                <tbody>
                  {(list.data?.certificados || []).length === 0 ? <Empty msg="Nenhum certificado cadastrado" /> :
                    (list.data?.certificados || []).map(r => (
                      <tr key={r.alias}>
                        <td className="primary">{clientName(r.alias)}</td>
                        <td className="mono">{r.alias}</td>
                        <td className="mono" style={{ color: 'var(--text-3)', fontSize: 12 }}>{r.file_name}</td>
                        <td><StatusBadge value={r.status} /></td>
                        <td className="actions">
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-xs" onClick={() => { setCurrent(r); setForm({ alias: r.alias, client_name: r.client_name, password: '', file: null }); setModal('edit'); }}>
                              <IconEdit />
                            </button>
                            <button className="btn btn-ghost btn-xs" onClick={() => { setCurrent(r); setPassForm({ password: '', confirm: '' }); setModal('pass'); }}>
                              <IconLock />
                            </button>
                            <button className="btn btn-danger btn-xs" onClick={() => setConfirm(r.alias)}>
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Novo */}
      <Modal open={modal === 'new'} title="Cadastrar certificado" onClose={() => { if (!saving) { setFormError(''); setModal(null); } }}>
        <form onSubmit={submitNew}>
          {formError ? <Alert type="error">{formError}</Alert> : null}
          <div className="form-grid form-cols-2">
            <div className="field">
              <label className="label">Alias *</label>
              <input className="input" required value={form.alias} onChange={e => f('alias', e.target.value)} placeholder="17 - EMPRESA LTDA" />
            </div>
            <div className="field">
              <label className="label">Nome do cliente</label>
              <input className="input" value={form.client_name} onChange={e => f('client_name', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Senha do certificado *</label>
              <input className="input" type="password" required value={form.password} onChange={e => f('password', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Arquivo PFX *</label>
              <input className="input" type="file" accept=".pfx" required onChange={e => f('file', e.target.files?.[0] || null)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => { setFormError(''); setModal(null); }}>Cancelar</button>
            <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? <Spinner size={13} /> : 'Salvar'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Editar */}
      <Modal open={modal === 'edit'} title={`Editar — ${current?.alias}`} onClose={() => setModal(null)}>
        <form onSubmit={submitEdit}>
          <div className="form-grid form-cols-2">
            <div className="field">
              <label className="label">Alias</label>
              <input className="input" required value={form.alias} onChange={e => f('alias', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">Nome do cliente</label>
              <input className="input" value={form.client_name} onChange={e => f('client_name', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? <Spinner size={13} /> : 'Atualizar'}</button>
          </div>
        </form>
      </Modal>

      {/* Modal Senha */}
      <Modal open={modal === 'pass'} title={`Redefinir senha — ${current?.alias}`} onClose={() => setModal(null)}>
        <form onSubmit={submitPass}>
          <div className="form-grid">
            <div className="field">
              <label className="label">Nova senha</label>
              <input className="input" type="password" required value={passForm.password} onChange={e => setPassForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Confirmar senha</label>
              <input className="input" type="password" required value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? <Spinner size={13} /> : 'Redefinir'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!confirm} title="Excluir certificado"
        msg={`Deseja excluir o certificado "${confirm}"? O arquivo .pfx e a senha serão removidos permanentemente.`}
        danger onOk={doDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
}

// ── Page: Credenciais ────────────────────────────────────────
function CredenciaisPage({ baseUrl, toast }) {
  const list = useAsync(() => api(baseUrl, '/credenciais'), [baseUrl]);
  const [modal, setModal] = useState(null);
  const [current, setCurrent] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ alias: '', cpf_cnpj: '', password: '' });
  const [passForm, setPassForm] = useState({ password: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const submitNew = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api(baseUrl, '/credenciais', { method: 'POST', body: form });
      toast('Credencial cadastrada.', 'success');
      setModal(null); setForm({ alias: '', cpf_cnpj: '', password: '' }); list.reload();
    } catch (e) { toast(e.message, 'error'); } finally { setSaving(false); }
  };

  const submitEdit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      await api(baseUrl, `/credenciais/${current.alias}`, { method: 'PUT', body: { alias: form.alias, cpf_cnpj: form.cpf_cnpj } });
      toast('Credencial atualizada.', 'success'); setModal(null); list.reload();
    } catch (e) { toast(e.message, 'error'); } finally { setSaving(false); }
  };

  const submitPass = async e => {
    e.preventDefault();
    if (passForm.password !== passForm.confirm) { toast('As senhas não coincidem.', 'error'); return; }
    setSaving(true);
    try {
      await api(baseUrl, `/credenciais/${current.alias}/senha`, { method: 'PUT', body: { password: passForm.password } });
      toast('Senha redefinida.', 'success'); setModal(null);
    } catch (e) { toast(e.message, 'error'); } finally { setSaving(false); }
  };

  const doDelete = async () => {
    try {
      await api(baseUrl, `/credenciais/${confirm}`, { method: 'DELETE' });
      toast('Credencial excluída.', 'success'); setConfirm(null); list.reload();
    } catch (e) { toast(e.message, 'error'); setConfirm(null); }
  };

  return (
    <div className="page-enter">
      <SectionHeader title="Credenciais" sub="Acesso por CPF/CNPJ e senha"
        actions={<button className="btn btn-primary btn-sm" onClick={() => { setForm({ alias: '', cpf_cnpj: '', password: '' }); setModal('new'); }}><IconPlus /> Nova credencial</button>}
      />

      <div className="card">
        <div className="card-body" style={{ padding: 0 }}>
          {list.loading ? <div style={{ padding: 24 }}><Loading /></div> : (
            <div className="table-wrap scrollable" style={{ border: 'none', borderRadius: 0 }}>
              <table>
                <thead><tr>
                  <th>Empresa</th><th>Alias</th><th>Documento</th><th>Status</th><th>Senha</th><th></th>
                </tr></thead>
                <tbody>
                  {(list.data?.credenciais || []).length === 0 ? <Empty msg="Nenhuma credencial cadastrada" /> :
                    (list.data?.credenciais || []).map(r => (
                      <tr key={r.alias}>
                        <td className="primary">{clientName(r.alias)}</td>
                        <td className="mono">{r.alias}</td>
                        <td className="mono">{r.document}</td>
                        <td><StatusBadge value={r.status} /></td>
                        <td><Badge tone={r.has_password ? 'success' : 'danger'}>{r.has_password ? 'Configurada' : 'Não'}</Badge></td>
                        <td className="actions">
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn btn-ghost btn-xs" onClick={() => { setCurrent(r); setForm({ alias: r.alias, cpf_cnpj: r.document || '', password: '' }); setModal('edit'); }}>
                              <IconEdit />
                            </button>
                            <button className="btn btn-ghost btn-xs" onClick={() => { setCurrent(r); setPassForm({ password: '', confirm: '' }); setModal('pass'); }}>
                              <IconLock />
                            </button>
                            <button className="btn btn-danger btn-xs" onClick={() => setConfirm(r.alias)}>
                              <IconTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal open={modal === 'new'} title="Cadastrar credencial" onClose={() => setModal(null)}>
        <form onSubmit={submitNew}>
          <div className="form-grid">
            <div className="field">
              <label className="label">Alias *</label>
              <input className="input" required value={form.alias} onChange={e => f('alias', e.target.value)} placeholder="17 - EMPRESA LTDA" />
            </div>
            <div className="field">
              <label className="label">CPF/CNPJ *</label>
              <input className="input" required value={form.cpf_cnpj} onChange={e => f('cpf_cnpj', e.target.value)} placeholder="00.000.000/0000-00" />
              <span className="input-hint">Somente CPFs e CNPJs válidos são aceitos</span>
            </div>
            <div className="field">
              <label className="label">Senha *</label>
              <input className="input" type="password" required value={form.password} onChange={e => f('password', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? <Spinner size={13} /> : 'Salvar'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'edit'} title={`Editar — ${current?.alias}`} onClose={() => setModal(null)}>
        <form onSubmit={submitEdit}>
          <div className="form-grid form-cols-2">
            <div className="field">
              <label className="label">Alias</label>
              <input className="input" required value={form.alias} onChange={e => f('alias', e.target.value)} />
            </div>
            <div className="field">
              <label className="label">CPF/CNPJ</label>
              <input className="input" value={form.cpf_cnpj} onChange={e => f('cpf_cnpj', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? <Spinner size={13} /> : 'Atualizar'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'pass'} title={`Redefinir senha — ${current?.alias}`} onClose={() => setModal(null)}>
        <form onSubmit={submitPass}>
          <div className="form-grid">
            <div className="field">
              <label className="label">Nova senha</label>
              <input className="input" type="password" required value={passForm.password} onChange={e => setPassForm(p => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Confirmar senha</label>
              <input className="input" type="password" required value={passForm.confirm} onChange={e => setPassForm(p => ({ ...p, confirm: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>Cancelar</button>
            <button className="btn btn-primary btn-sm" disabled={saving}>{saving ? <Spinner size={13} /> : 'Redefinir'}</button>
          </div>
        </form>
      </Modal>

      <Confirm open={!!confirm} title="Excluir credencial"
        msg={`Deseja excluir a credencial "${confirm}"?`}
        danger onOk={doDelete} onCancel={() => setConfirm(null)} />
    </div>
  );
}

// ── Page: Configurações ──────────────────────────────────────
function ConfiguracoesPage({ baseUrl, setBaseUrl, toast }) {
  const [url, setUrl] = useState(baseUrl);
  const [pinging, setPinging] = useState(false);
  const [pingRes, setPingRes] = useState(null);

  useEffect(() => { setUrl(baseUrl); }, [baseUrl]);

  const ping = async () => {
    setPinging(true); setPingRes(null);
    const cleanedUrl = normalizeBaseUrl(url);
    if (!isHttpUrl(cleanedUrl)) {
      const msg = 'Informe uma URL válida iniciando com http:// ou https://.';
      setPingRes({ ok: false, msg });
      toast(msg, 'error');
      setPinging(false);
      return;
    }
    if (isLocalhostUrl(cleanedUrl)) {
      const msg = 'URL local (localhost/127.0.0.1) não é permitida no portal publicado.';
      setPingRes({ ok: false, msg });
      toast(msg, 'error');
      setPinging(false);
      return;
    }
    try {
      const d = await api(cleanedUrl, '/health');
      setPingRes({ ok: true, msg: `API conectada — status: ${d.status}` });
      setBaseUrl(cleanedUrl);
      toast('Conexão estabelecida com sucesso.', 'success');
    } catch (e) {
      setPingRes({ ok: false, msg: e.message });
      toast('Falha na conexão: ' + e.message, 'error');
    } finally { setPinging(false); }
  };

  return (
    <div className="page-enter">
      <SectionHeader title="Configurações" sub="Conexão e preferências do portal" />

      <div className="card" style={{ maxWidth: 600 }}>
        <div className="card-header"><span className="card-title">Conexão com a API</span></div>
        <div className="card-body">
          <div className="form-grid">
            <div className="field">
              <label className="label">URL da API</label>
              <input className="input" value={url} onChange={e => setUrl(e.target.value)}
                placeholder={DEFAULT_API_URL || 'https://api.exemplo.com'}
                onKeyDown={e => e.key === 'Enter' && ping()} />
              <span className="input-hint">Defina via VITE_API_BASE_URL (Vite) ou window.__APP_CONFIG__.API_BASE_URL (estático)</span>
            </div>
            {pingRes && <Alert type={pingRes.ok ? 'success' : 'error'}>{pingRes.msg}</Alert>}
            <div>
              <button className="btn btn-primary btn-sm" disabled={pinging} onClick={ping}>
                {pinging ? <><Spinner size={13} /> Testando...</> : '⚡ Testar conexão'}
              </button>
            </div>
          </div>

          <div className="divider" />

          <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 600, color: 'var(--text-2)', marginBottom: 8 }}>Rotas da API</div>
            {[
              ['POST /certificados',           'multipart/form-data'],
              ['POST /credenciais',             'JSON — CPF/CNPJ validado'],
              ['POST /executar',                'JSON — disparo manual'],
              ['POST /agendar',                 'JSON — modo automático diário'],
              ['PUT  /nfse/{id}',               'JSON — salvar edições do relatório'],
              ['GET  /processos/{id}/arquivos/{arq}/download', 'stream — MinIO ou local'],
              ['POST /admin/limpar-minio',      'limpeza manual de arquivos antigos'],
            ].map(([rota, desc]) => (
              <div key={rota} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--border-soft)' }}>
                <code style={{ color: 'var(--accent)', fontSize: 11, minWidth: 240 }}>{rota}</code>
                <span style={{ color: 'var(--text-3)', fontSize: 11 }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── App Shell ────────────────────────────────────────────────
function App() {
  const [active, setActive] = useState('dashboard');
  const [baseUrl, setBaseUrl] = useState(resolveApiBaseUrl);
  const [apiStatus, setApiStatus] = useState('idle');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarVisible, setDesktopSidebarVisible] = useState(true);
  const { toasts, toast } = useToast();

  useEffect(() => {
    const cleaned = normalizeBaseUrl(baseUrl);

    const next = isAllowedApiBaseUrl(cleaned) ? cleaned : DEFAULT_API_BASE_URL;

    if (next !== baseUrl) {
      setBaseUrl(next);
      return;
    }
    if (next) localStorage.setItem(API_URL_STORAGE_KEY, next);
    else localStorage.removeItem(API_URL_STORAGE_KEY);
  }, [baseUrl]);

  useEffect(() => {
    if (!baseUrl) {
      setApiStatus('err');
      return;
    }
    const check = async () => {
      try { await api(baseUrl, '/health'); setApiStatus('ok'); }
      catch { setApiStatus('err'); }
    };
    check();
    const iv = setInterval(check, 30000);
    return () => clearInterval(iv);
  }, [baseUrl]);

  useEffect(() => {
    if (active !== 'fila_trabalho' && active !== 'fila_trabalho_b') {
      setDesktopSidebarVisible(true);
    }
  }, [active]);

  const navigate = k => { setActive(k); setMobileOpen(false); };
  const isQueuePageActive = active === 'fila_trabalho' || active === 'fila_trabalho_b';

  const sections = [...new Set(MENU.map(m => m.section))];

  const SidebarContent = () => (
    <>
      <div className="sidebar-brand">
        <div className="sidebar-brand-logo">
          <div className="sidebar-brand-icon">
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#042f2e" strokeWidth={2.5}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
            </svg>
          </div>
          <span className="sidebar-brand-name">NFS-e Portal</span>
        </div>
        <div className="sidebar-brand-sub">Auditoria Fiscal</div>
      </div>

      {sections.map(sec => (
        <div key={sec} className="sidebar-section">
          <div className="sidebar-section-label">{sec}</div>
          {MENU.filter(m => m.section === sec).map(item => (
            <button key={item.key} className={cn('nav-item', active === item.key && 'active')}
              onClick={() => navigate(item.key)}>
              <span className="nav-icon"><item.icon /></span>
              {item.label}
            </button>
          ))}
        </div>
      ))}

      <div className="sidebar-footer">
        <div className="api-status">
          <div className={cn('status-dot', apiStatus)} />
          <span>{!baseUrl ? 'API não configurada' : apiStatus === 'ok' ? 'API conectada' : apiStatus === 'err' ? 'API offline' : 'Verificando...'}</span>
        </div>
      </div>
    </>
  );

  const pageProps = { baseUrl, toast };
  const pages = {
    dashboard:    <DashboardPage {...pageProps} />,
    execucao:     <ExecucaoPage {...pageProps} />,
    agendamentos: <AgendamentosPage {...pageProps} />,
    fila_trabalho:<FilaDeTrabalhoPage {...pageProps} navigate={navigate} variant="a" sidebarVisible={desktopSidebarVisible} onToggleSidebar={() => setDesktopSidebarVisible(v => !v)} />,
    fila_trabalho_b:<FilaDeTrabalhoPage {...pageProps} navigate={navigate} variant="b" sidebarVisible={desktopSidebarVisible} onToggleSidebar={() => setDesktopSidebarVisible(v => !v)} />,
    processos:    <ProcessosPage {...pageProps} />,
    nfse:         <NFSePage {...pageProps} />,
    relatorio:    <RelatorioPage {...pageProps} />,
    certificados: <CertificadosPage {...pageProps} />,
    credenciais:  <CredenciaisPage {...pageProps} />,
    configuracoes:<ConfiguracoesPage {...pageProps} baseUrl={baseUrl} setBaseUrl={u => { setBaseUrl(u); setApiStatus('idle'); }} />,
  };

  const currentMenu = MENU.find(m => m.key === active);

  const showApiMissing = !baseUrl && active !== 'configuracoes';

  return (
    <div className={cn('app-shell', isQueuePageActive && 'focus-mode', isQueuePageActive && !desktopSidebarVisible && 'sidebar-hidden')}>
      {/* Desktop sidebar */}
      {desktopSidebarVisible && (
        <aside className="sidebar">
          <SidebarContent />
        </aside>
      )}

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileOpen(false)} />
          <aside className="sidebar" style={{ display: 'flex', position: 'relative', zIndex: 201 }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="main">
        {/* Mobile topbar */}
        <div className="mobile-topbar">
          <button className="hamburger" onClick={() => setMobileOpen(true)}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>NFS-e Portal</span>
          <div className={cn('status-dot', apiStatus)} />
        </div>

        {/* Desktop topbar */}
        <div className="topbar">
          <span className="topbar-title">{currentMenu?.label}</span>
          <span className="topbar-sep">/</span>
          <span className="topbar-sub">Portal de Auditoria Fiscal</span>
          <div className="topbar-actions">
            <div className="api-status" style={{ background: 'transparent', border: 'none', padding: '4px 8px' }}>
              <div className={cn('status-dot', apiStatus)} />
              <span style={{ fontSize: 11 }}>{baseUrl}</span>
            </div>
          </div>
        </div>

        <div className="page-content">
          {showApiMissing ? (
            <div className="card" style={{ maxWidth: 760 }}>
              <div className="card-body">
                <Alert type="error">
                  API não configurada. Configure a URL em <strong>Configurações</strong> para continuar.
                </Alert>
                <div style={{ marginTop: 12 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => navigate('configuracoes')}>
                    Abrir configurações
                  </button>
                </div>
              </div>
            </div>
          ) : (pages[active] || <div />)}
        </div>
      </div>

      <ToastContainer toasts={toasts} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

