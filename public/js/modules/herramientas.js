'use strict';

const HerramientasModule = {
  async init() {
    if (!AppState.categorias.length) {
      const { data } = await http('/api/categorias');
      AppState.categorias = data;
    }
    if (!AppState.proveedores.length) {
      const { data } = await http('/api/proveedores');
      AppState.proveedores = data;
    }
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyHerramientas').innerHTML =
      `<tr><td colspan="8" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;
    try {
      const { data } = await http('/api/herramientas');
      AppState.herramientas = data;
      this._render(data);
      updateBadges();
    } catch (e) { showToast('Error al cargar herramientas: ' + e.message, 'error'); }
  },

  _estadoBadge(estado) {
    const map = {
      disponible: 'background:rgba(16,185,129,.12);color:#059669',
      prestada: 'background:rgba(245,158,11,.12);color:#d97706',
      mantenimiento: 'background:rgba(99,102,241,.12);color:#6366f1',
      dañada: 'background:rgba(239,68,68,.12);color:#dc2626',
    };
    const s = map[estado] || '';
    return `<span style="${s};padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600;text-transform:capitalize">${estado}</span>`;
  },

  _render(lista) {
    setText('totalHerramientasLabel', `${lista.length} herramienta(s) encontrada(s)`);
    const tbody = document.getElementById('bodyHerramientas');
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><i class="bi bi-wrench-adjustable"></i><p>No hay herramientas</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = lista.map((h, i) => `
      <tr>
        <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
        <td>
          <div style="font-weight:600;font-size:14px">${escapeHtml(h.nombre)}</div>
          <div style="font-size:12px;color:var(--text-muted)">${escapeHtml(h.marca||'—')} ${h.modelo ? '· ' + escapeHtml(h.modelo) : ''}</div>
        </td>
        <td><span style="font-family:'DM Mono',monospace;font-size:12px;background:var(--surface-2);padding:2px 8px;border-radius:4px">${escapeHtml(h.codigo)}</span></td>
        <td style="font-size:13px;color:var(--text-muted)">${escapeHtml(h.nombre_categoria||'—')}</td>
        <td>${this._estadoBadge(h.estado)}</td>
        <td style="text-align:center">
          <span style="font-weight:600;color:${h.cantidad_dispo>0?'var(--success)':'var(--danger)'}">${h.cantidad_dispo}</span>
          <span style="color:var(--text-muted)">/${h.cantidad_total}</span>
        </td>
        <td style="font-size:13px;color:var(--text-muted)">${escapeHtml(h.ubicacion||'—')}</td>
        <td>
          <button class="btn-action btn-action-edit" onclick="HerramientasModule.openEdit(${h.id})" title="Editar"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn-action btn-action-delete" onclick="HerramientasModule.confirmDel(${h.id},'${escapeHtml(h.nombre)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
        </td>
      </tr>`).join('');
  },

  _filter() {
    const q = document.getElementById('searchHerramienta')?.value.toLowerCase() || '';
    const estado = document.getElementById('filterEstado')?.value || '';
    this._render(AppState.herramientas.filter(h =>
      (!q || h.nombre.toLowerCase().includes(q) || h.codigo.toLowerCase().includes(q) || (h.marca||'').toLowerCase().includes(q)) &&
      (!estado || h.estado === estado)
    ));
  },

  _populateSelects() {
    const selCat = document.getElementById('hCategoria');
    const selProv = document.getElementById('hProveedor');
    if (selCat) selCat.innerHTML = `<option value="">— Sin categoría —</option>` +
      AppState.categorias.map(c => `<option value="${c.id}">${escapeHtml(c.nombre)}</option>`).join('');
    if (selProv) selProv.innerHTML = `<option value="">— Sin proveedor —</option>` +
      AppState.proveedores.map(p => `<option value="${p.id}">${escapeHtml(p.razon_social)}</option>`).join('');
  },

  _openModal(mode, h = null) {
    const isEdit = mode === 'edit';
    setText('modalHerramientaTitle', isEdit ? 'Editar Herramienta' : 'Nueva Herramienta');
    setText('modalHerramientaSubtitle', isEdit ? `Editando: ${h.nombre}` : 'Completa los campos del formulario');
    ['herramientaId','hCodigo','hNombre','hTipo','hMarca','hModelo','hNumSerie','hUbicacion'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('hCantidad').value = 1;
    document.getElementById('hEstado').value = 'disponible';
    this._populateSelects();
    clearErrors(['hCodigo','hNombre']);

    if (isEdit) {
      document.getElementById('herramientaId').value = h.id;
      document.getElementById('hCodigo').value = h.codigo || '';
      document.getElementById('hNombre').value = h.nombre || '';
      document.getElementById('hTipo').value = h.tipo || '';
      document.getElementById('hMarca').value = h.marca || '';
      document.getElementById('hModelo').value = h.modelo || '';
      document.getElementById('hNumSerie').value = h.numero_serie || '';
      document.getElementById('hEstado').value = h.estado || 'disponible';
      document.getElementById('hCantidad').value = h.cantidad_total || 1;
      document.getElementById('hUbicacion').value = h.ubicacion || '';
      if (h.id_categoria) document.getElementById('hCategoria').value = h.id_categoria;
      if (h.id_proveedor) document.getElementById('hProveedor').value = h.id_proveedor;
    }
    openOverlay('modalHerramientaOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/herramientas/${id}`);
      this._openModal('edit', data);
    } catch (e) { showToast(e.message, 'error'); }
  },

  confirmDel(id, name) {
    DeleteModal.open('herramienta', id, name, async () => {
      try {
        await http(`/api/herramientas/${id}`, 'DELETE');
        showToast(`"${name}" eliminada`, 'success');
        await this.load();
      } catch (e) { showToast(e.message, 'error'); }
    });
  },

  async _save() {
    clearErrors(['hCodigo','hNombre']);
    let ok = true;
    if (!document.getElementById('hCodigo').value.trim()) { setError('hCodigo','err-hCodigo','El código es requerido'); ok = false; }
    if (!document.getElementById('hNombre').value.trim()) { setError('hNombre','err-hNombre','El nombre es requerido'); ok = false; }
    if (!ok) return;

    const id = document.getElementById('herramientaId').value;
    const body = {
      codigo: document.getElementById('hCodigo').value.trim(),
      nombre: document.getElementById('hNombre').value.trim(),
      tipo: document.getElementById('hTipo').value.trim() || null,
      marca: document.getElementById('hMarca').value.trim() || null,
      modelo: document.getElementById('hModelo').value.trim() || null,
      numero_serie: document.getElementById('hNumSerie').value.trim() || null,
      estado: document.getElementById('hEstado').value,
      cantidad_total: document.getElementById('hCantidad').value,
      ubicacion: document.getElementById('hUbicacion').value.trim() || null,
      id_categoria: document.getElementById('hCategoria').value || null,
      id_proveedor: document.getElementById('hProveedor').value || null,
    };
    setLoading('btnSaveHerramienta','btnSaveHText','btnSaveHSpinner', true);
    try {
      await http(id ? `/api/herramientas/${id}` : '/api/herramientas', id ? 'PUT' : 'POST', body);
      showToast(`Herramienta ${id ? 'actualizada' : 'creada'}`, 'success');
      closeOverlay('modalHerramientaOverlay');
      await this.load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading('btnSaveHerramienta','btnSaveHText','btnSaveHSpinner', false); }
  },

  _bindEvents() {
    document.getElementById('btnNuevaHerramienta')?.addEventListener('click', () => this._openModal('new'));
    document.getElementById('btnSaveHerramienta')?.addEventListener('click', () => this._save());
    document.getElementById('btnCancelHerramienta')?.addEventListener('click', () => closeOverlay('modalHerramientaOverlay'));
    document.getElementById('btnCloseModalHerramienta')?.addEventListener('click', () => closeOverlay('modalHerramientaOverlay'));
    document.getElementById('btnRefreshHerramientas')?.addEventListener('click', () => this.load());
    document.getElementById('searchHerramienta')?.addEventListener('input', () => this._filter());
    document.getElementById('filterEstado')?.addEventListener('change', () => this._filter());
    document.getElementById('modalHerramientaOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalHerramientaOverlay') closeOverlay('modalHerramientaOverlay');
    });
  },
};
