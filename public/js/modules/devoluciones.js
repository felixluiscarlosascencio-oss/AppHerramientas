'use strict';

const DevolucionesModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyDevoluciones').innerHTML =
      `<tr><td colspan="6" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;
    try {
      const { data } = await http('/api/devoluciones');
      AppState.devoluciones = data;
      this._render(data);
      updateBadges();
    } catch (e) { showToast('Error al cargar devoluciones: ' + e.message, 'error'); }
  },

  _estBadge(est) {
    const map = {
      bueno: 'background:rgba(16,185,129,.12);color:#059669',
      regular: 'background:rgba(245,158,11,.12);color:#d97706',
      dañado: 'background:rgba(239,68,68,.12);color:#dc2626',
    };
    return `<span style="${map[est]||'background:var(--surface-2)'};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize">${est||'—'}</span>`;
  },

  _render(lista) {
    setText('totalDevolucionesLabel', `${lista.length} devolución(es) encontrada(s)`);
    const tbody = document.getElementById('bodyDevoluciones');
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-arrow-return-left"></i><p>No hay devoluciones registradas</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = lista.map((d, i) => `
      <tr>
        <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
        <td><strong>${escapeHtml(d.nombre_usuario)}</strong></td>
        <td>${escapeHtml(d.nombre_herramienta)}</td>
        <td style="font-size:13px">${formatFecha(d.fecha_devo)}</td>
        <td>${this._estBadge(d.est_herramienta)}</td>
        <td style="font-size:13px;color:var(--text-muted)">${escapeHtml(d.observaciones||'—')}</td>
      </tr>`).join('');
  },

  _bindEvents() {
    document.getElementById('btnRefreshDevoluciones')?.addEventListener('click', () => this.load());
    document.getElementById('searchDevolucion')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      this._render(AppState.devoluciones.filter(d =>
        d.nombre_usuario.toLowerCase().includes(q) || d.nombre_herramienta.toLowerCase().includes(q)
      ));
    });
  },
};
