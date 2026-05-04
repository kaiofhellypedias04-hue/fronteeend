(function (global) {
  function cn(...c) { return c.filter(Boolean).join(' '); }

  function fmtMoney(v) {
    if (v === null || v === undefined || v === '') return '—';
    const n = Number(v);
    if (isNaN(n)) return String(v);
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function toCSV(rows) {
    if (!rows?.length) return '';
    const h = Object.keys(rows[0]);
    const esc = v => '"' + String(v ?? '').replace(/"/g, '""') + '"';
    return '\uFEFF' + [h.join(';'), ...rows.map(r => h.map(k => esc(r[k])).join(';'))].join('\n');
  }

  global.NFSEFormat = Object.freeze({
    cn,
    fmtMoney,
    toCSV,
  });
})(window);
