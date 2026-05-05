'use strict';

const PrestamosModule = {
  _devolverId: null,

  async init() {
    if (!AppState.usuarios.length) {
      const { data } = await http('/api/usuarios');
      AppState.usuarios = data;
    }
    if (!AppState.herramientas.length) {
      const { data } = await http('/api/herramientas');
      AppState.herramientas = data;
    }
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyPrestamos').innerHTML =
      `<tr><td colspan="8" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;
    try {
      const { data } = await http('/api/prestamos');
      AppState.prestamos = data;
      this._render(data);
      updateBadges();
    } catch (e) { showToast('Error al cargar préstamos: ' + e.message, 'error'); }
  },

  _estadoBadge(estado) {
    const map = {
      activo:   'background:rgba(245,158,11,.12);color:#d97706',
      devuelto: 'background:rgba(16,185,129,.12);color:#059669',
      atrasado: 'background:rgba(239,68,68,.12);color:#dc2626',
    };
    return `<span style="${map[estado]||''};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize">${estado}</span>`;
  },

  _render(lista) {
    setText('totalPrestamosLabel', `${lista.length} préstamo(s) encontrado(s)`);
    const tbody = document.getElementById('bodyPrestamos');
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-arrow-left-right"></i><p>No hay préstamos</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = lista.map((p, i) => `
      <tr>
        <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
        <td><strong>${escapeHtml(p.nombre_usuario)}</strong></td>
        <td>
          <div style="font-size:14px">${escapeHtml(p.nombre_herramienta)}</div>
          <div style="font-size:11px;color:var(--text-muted);font-family:'DM Mono',monospace">${escapeHtml(p.codigo_herramienta||'')}</div>
        </td>
        <td style="text-align:center;font-weight:600">${p.cantidad_pres}</td>
        <td style="font-size:13px">${formatFecha(p.fecha_salida)}</td>
        <td style="font-size:13px">${formatFecha(p.fecha_devolucion_esperada)}</td>
        <td>${this._estadoBadge(p.estado_prestamo)}</td>
        <td style="white-space:nowrap">
          ${p.estado_prestamo === 'activo' ? `
            <button class="btn-action" style="background:rgba(16,185,129,.1);color:var(--success)" onclick="PrestamosModule.openDevolucion(${p.id},'${escapeHtml(p.nombre_herramienta)}')" title="Registrar devolución">
              <i class="bi bi-arrow-return-left"></i>
            </button>` : ''}
          <button class="btn-action btn-action-delete" onclick="PrestamosModule.confirmDel(${p.id},'${escapeHtml(p.nombre_herramienta)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
        </td>
      </tr>`).join('');
  },

  _filter() {
    const q = document.getElementById('searchPrestamo')?.value.toLowerCase() || '';
    const estado = document.getElementById('filterEstadoPrestamo')?.value || '';
    this._render(AppState.prestamos.filter(p =>
      (!q || p.nombre_usuario.toLowerCase().includes(q) || p.nombre_herramienta.toLowerCase().includes(q)) &&
      (!estado || p.estado_prestamo === estado)
    ));
  },

  _populateSelects() {
    const selU = document.getElementById('prUsuario');
    const selH = document.getElementById('prHerramienta');
    if (selU) selU.innerHTML = `<option value="">— Seleccionar usuario —</option>` +
      AppState.usuarios.map(u => `<option value="${u.id}">${escapeHtml(u.nombre)}${u.area ? ' · ' + escapeHtml(u.area) : ''}</option>`).join('');
    if (selH) selH.innerHTML = `<option value="">— Seleccionar herramienta —</option>` +
      AppState.herramientas.filter(h => h.cantidad_dispo > 0)
        .map(h => `<option value="${h.id}">[${escapeHtml(h.codigo)}] ${escapeHtml(h.nombre)} (Disp: ${h.cantidad_dispo})</option>`).join('');
  },

  _openModal() {
    setText('modalPrestamoTitle', 'Nuevo Préstamo');
    setText('modalPrestamoSubtitle', 'Completa los campos del formulario');
    document.getElementById('prestamoId').value = '';
    document.getElementById('prCantidad').value = 1;
    document.getElementById('prAreaUso').value = '';
    document.getElementById('prMotivo').value = '';
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('prFechaSalida').value = today;
    document.getElementById('prFechaDevolucion').value = '';
    this._populateSelects();
    clearErrors(['prUsuario','prHerramienta','prFechaSalida','prFechaDevolucion']);
    openOverlay('modalPrestamoOverlay');
  },

  openDevolucion(id, nombreHerramienta) {
    this._devolverId = id;
    document.getElementById('devolucionRapidaMsg').textContent =
      `¿Confirmar la devolución de "${nombreHerramienta}"?`;
    document.getElementById('devEstado').value = 'bueno';
    document.getElementById('devObservaciones').value = '';
    openOverlay('modalDevolucionRapidaOverlay');
  },

  async _confirmarDevolucion() {
    if (!this._devolverId) return;
    const body = {
      est_herramienta: document.getElementById('devEstado').value,
      observaciones: document.getElementById('devObservaciones').value.trim() || null,
    };
    try {
      await http(`/api/prestamos/${this._devolverId}/devolver`, 'PUT', body);
      showToast('Devolución registrada correctamente', 'success');
      closeOverlay('modalDevolucionRapidaOverlay');
      // Refresh herramientas state
      const { data: hData } = await http('/api/herramientas');
      AppState.herramientas = hData;
      await this.load();
    } catch (e) { showToast(e.message, 'error'); }
  },

  confirmDel(id, name) {
    DeleteModal.open('prestamo', id, name, async () => {
      try {
        await http(`/api/prestamos/${id}`, 'DELETE');
        showToast('Préstamo eliminado', 'success');
        await this.load();
      } catch (e) { showToast(e.message, 'error'); }
    });
  },

  async _save() {
    clearErrors(['prUsuario','prHerramienta','prFechaSalida','prFechaDevolucion']);
    let ok = true;
    if (!document.getElementById('prUsuario').value) { setError('prUsuario','err-prUsuario','Selecciona un usuario'); ok = false; }
    if (!document.getElementById('prHerramienta').value) { setError('prHerramienta','err-prHerramienta','Selecciona una herramienta'); ok = false; }
    if (!document.getElementById('prFechaSalida').value) { setError('prFechaSalida','err-prFechaSalida','La fecha de salida es requerida'); ok = false; }
    if (!document.getElementById('prFechaDevolucion').value) { setError('prFechaDevolucion','err-prFechaDevolucion','La fecha de devolución es requerida'); ok = false; }
    if (!ok) return;

    const body = {
      id_usuario: document.getElementById('prUsuario').value,
      id_herramienta: document.getElementById('prHerramienta').value,
      cantidad_pres: document.getElementById('prCantidad').value,
      fecha_salida: document.getElementById('prFechaSalida').value,
      fecha_devolucion_esperada: document.getElementById('prFechaDevolucion').value,
      area_uso: document.getElementById('prAreaUso').value.trim() || null,
      motivo: document.getElementById('prMotivo').value.trim() || null,
    };
    setLoading('btnSavePrestamo','btnSavePrText','btnSavePrSpinner', true);
    try {
      await http('/api/prestamos', 'POST', body);
      showToast('Préstamo registrado correctamente', 'success');
      closeOverlay('modalPrestamoOverlay');
      // Refresh herramientas stock
      const { data: hData } = await http('/api/herramientas');
      AppState.herramientas = hData;
      await this.load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading('btnSavePrestamo','btnSavePrText','btnSavePrSpinner', false); }
  },

  _bindEvents() {
    document.getElementById('btnNuevoPrestamo')?.addEventListener('click', () => this._openModal());
    document.getElementById('btnSavePrestamo')?.addEventListener('click', () => this._save());
    document.getElementById('btnCancelPrestamo')?.addEventListener('click', () => closeOverlay('modalPrestamoOverlay'));
    document.getElementById('btnCloseModalPrestamo')?.addEventListener('click', () => closeOverlay('modalPrestamoOverlay'));
    document.getElementById('btnRefreshPrestamos')?.addEventListener('click', () => this.load());
    document.getElementById('searchPrestamo')?.addEventListener('input', () => this._filter());
    document.getElementById('filterEstadoPrestamo')?.addEventListener('change', () => this._filter());
    document.getElementById('modalPrestamoOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalPrestamoOverlay') closeOverlay('modalPrestamoOverlay');
    });
    document.getElementById('btnConfirmDevolucion')?.addEventListener('click', () => this._confirmarDevolucion());
    document.getElementById('btnCancelDevolucionRapida')?.addEventListener('click', () => closeOverlay('modalDevolucionRapidaOverlay'));
    document.getElementById('btnCloseDevolucionRapida')?.addEventListener('click', () => closeOverlay('modalDevolucionRapidaOverlay'));
    document.getElementById('modalDevolucionRapidaOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalDevolucionRapidaOverlay') closeOverlay('modalDevolucionRapidaOverlay');
    });
  },
};
