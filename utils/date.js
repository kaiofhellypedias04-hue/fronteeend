(function (global) {
  const {
    APP_LOCALE = 'pt-BR',
    APP_TIME_ZONE = 'America/Sao_Paulo',
  } = global.NFSEConstants || {};

  function fmtDate(v) {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d)) return String(v);
    return d.toLocaleString(APP_LOCALE, { timeZone: APP_TIME_ZONE });
  }

  function fmtDateShort(v) {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d)) return String(v);
    return d.toLocaleDateString(APP_LOCALE, { timeZone: APP_TIME_ZONE });
  }

  function fmtCompetenciaFromDate(v) {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString(APP_LOCALE, {
      timeZone: APP_TIME_ZONE,
      month: '2-digit',
      year: 'numeric',
    });
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

  global.NFSEDate = Object.freeze({
    fmtDate,
    fmtDateShort,
    fmtCompetenciaFromDate,
    toDateInputValue,
    shiftDate,
    today,
    yesterday,
  });
})(window);
