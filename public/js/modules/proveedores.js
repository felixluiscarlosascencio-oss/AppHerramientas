'use strict';

const ProveedoresModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyProveedores').innerHTML =
      `<tr><td colspan="7" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;
    try {
      const { data } = await http('/api/proveedores');
      AppState.proveedores = data;
      this._render(data);
      updateBadges();
    } catch (e) { showToast('Error al cargar proveedores: ' + e.message, 'error'); }
  },

  _render(lista) {
    setText('totalProveedoresLabel', `${lista.length} proveedor(es) encontrado(s)`);
    const tbody = document.getElementById('bodyProveedores');
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="bi bi-truck"></i><p>No hay proveedores</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = lista.map((p, i) => `
      <tr>
        <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
        <td><strong>${escapeHtml(p.razon_social)}</strong></td>
        <td style="font-size:13px;font-family:'DM Mono',monospace">${escapeHtml(p.ruc||'—')}</td>
        <td style="font-size:13px">${escapeHtml(p.contacto||'—')}</td>
        <td style="font-size:13px">${escapeHtml(p.telefono||'—')}</td>
        <td style="font-size:13px">${p.email ? `<a href="mailto:${escapeHtml(p.email)}" style="color:var(--primary)">${escapeHtml(p.email)}</a>` : '—'}</td>
        <td>
          <button class="btn-action btn-action-edit" onclick="ProveedoresModule.openEdit(${p.id})" title="Editar"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn-action btn-action-delete" onclick="ProveedoresModule.confirmDel(${p.id},'${escapeHtml(p.razon_social)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
        </td>
      </tr>`).join('');
  },

  _openModal(mode, p = null) {
    const isEdit = mode === 'edit';
    setText('modalProveedorTitle', isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor');
    document.getElementById('proveedorId').value = isEdit ? p.id : '';
    document.getElementById('pRazonSocial').value = isEdit ? p.razon_social : '';
    document.getElementById('pRuc').value = isEdit ? (p.ruc||'') : '';
    document.getElementById('pContacto').value = isEdit ? (p.contacto||'') : '';
    document.getElementById('pTelefono').value = isEdit ? (p.telefono||'') : '';
    document.getElementById('pEmail').value = isEdit ? (p.email||'') : '';
    clearErrors(['pRazonSocial']);
    openOverlay('modalProveedorOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/proveedores/${id}`);
      this._openModal('edit', data);
    } catch (e) { showToast(e.message, 'error'); }
  },

  confirmDel(id, name) {
    DeleteModal.open('proveedor', id, name, async () => {
      try {
        await http(`/api/proveedores/${id}`, 'DELETE');
        showToast(`"${name}" eliminado`, 'success');
        await this.load();
      } catch (e) { showToast(e.message, 'error'); }
    });
  },

  async _save() {
    clearErrors(['pRazonSocial']);
    if (!document.getElementById('pRazonSocial').value.trim()) { setError('pRazonSocial','err-pRazonSocial','La razón social es requerida'); return; }
    const id = document.getElementById('proveedorId').value;
    const body = {
      razon_social: document.getElementById('pRazonSocial').value.trim(),
      ruc: document.getElementById('pRuc').value.trim() || null,
      contacto: document.getElementById('pContacto').value.trim() || null,
      telefono: document.getElementById('pTelefono').value.trim() || null,
      email: document.getElementById('pEmail').value.trim() || null,
    };
    setLoading('btnSaveProveedor','btnSavePText','btnSavePSpinner', true);
    try {
      await http(id ? `/api/proveedores/${id}` : '/api/proveedores', id ? 'PUT' : 'POST', body);
      showToast(`Proveedor ${id ? 'actualizado' : 'creado'}`, 'success');
      closeOverlay('modalProveedorOverlay');
      await this.load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading('btnSaveProveedor','btnSavePText','btnSavePSpinner', false); }
  },

  _bindEvents() {
    document.getElementById('btnNuevoProveedor')?.addEventListener('click', () => this._openModal('new'));
    document.getElementById('btnSaveProveedor')?.addEventListener('click', () => this._save());
    document.getElementById('btnCancelProveedor')?.addEventListener('click', () => closeOverlay('modalProveedorOverlay'));
    document.getElementById('btnCloseModalProveedor')?.addEventListener('click', () => closeOverlay('modalProveedorOverlay'));
    document.getElementById('btnRefreshProveedores')?.addEventListener('click', () => this.load());
    document.getElementById('searchProveedor')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      this._render(AppState.proveedores.filter(p =>
        p.razon_social.toLowerCase().includes(q) || (p.ruc||'').includes(q)
      ));
    });
    document.getElementById('modalProveedorOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalProveedorOverlay') closeOverlay('modalProveedorOverlay');
    });
  },
};
