(function (global) {
  function normFilterValue(value) {
    return String(value || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9:]+/gi, ' ')
      .replace(/\s+/g, ' ')
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
    if (raw.includes('cancel')) return 'cancelada';
    if (raw.includes('pend')) return 'pendente';
    if (raw.includes('substit')) return 'substituida';
    return value || 'pendente';
  }

  function normalizeNotaStatus(value) {
    const raw = String(value || '').toLowerCase();
    if (raw.includes('substit')) return 'substituida';
    if (raw.includes('diverg')) return 'divergente';
    if (raw.includes('corret')) return 'correta';
    if (raw.includes('cancel')) return 'cancelada';
    if (raw.includes('pend')) return 'pendente';
    return value || 'pendente';
  }

  function normalizeProcessStatus(value) {
    const raw = String(value || '').toLowerCase();
    if (raw.includes('cancel')) return 'cancelada';
    if (raw.includes('queue')) return 'queued';
    if (raw.includes('run')) return 'running';
    if (raw.includes('complete') || raw.includes('success')) return 'completed';
    if (raw.includes('fail') || raw.includes('falh') || raw.includes('error')) return 'failed';
    return value || 'n/a';
  }

  function normalizeQueueDocumentStatus(value) {
    const raw = String(value || '').toLowerCase().trim();
    if (raw.includes('cancel')) return 'cancelada';
    if (raw.includes('substit')) return 'substituida';
    if (raw.includes('normal')) return 'normal';
    return '';
  }

  function tipoNotaLabel(value) {
    const normalized = normFilterValue(value);
    if (normalized.startsWith('tomad')) return 'Tomada';
    if (normalized.startsWith('prestad')) return 'Prestada';
    return value ? String(value) : '-';
  }

  global.NFSEStatus = Object.freeze({
    normFilterValue,
    normalizeQueuePriority,
    normalizeQueueStatus,
    normalizeNotaStatus,
    normalizeProcessStatus,
    normalizeQueueDocumentStatus,
    tipoNotaLabel,
  });
})(window);
