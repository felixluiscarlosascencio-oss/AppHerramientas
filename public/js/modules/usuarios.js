'use strict';

const UsuariosModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyUsuarios').innerHTML =
      `<tr><td colspan="6" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;
    try {
      const { data } = await http('/api/usuarios');
      AppState.usuarios = data;
      this._render(data);
      updateBadges();
    } catch (e) { showToast('Error al cargar usuarios: ' + e.message, 'error'); }
  },

  _render(lista) {
    setText('totalUsuariosLabel', `${lista.length} usuario(s) encontrado(s)`);
    const tbody = document.getElementById('bodyUsuarios');
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-people"></i><p>No hay usuarios</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = lista.map((u, i) => `
      <tr>
        <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
        <td><strong>${escapeHtml(u.nombre)}</strong></td>
        <td style="font-size:13px">${escapeHtml(u.dni||'—')}</td>
        <td style="font-size:13px">${escapeHtml(u.area||'—')}</td>
        <td>${u.turno ? `<span class="badge-marca">${escapeHtml(u.turno)}</span>` : '<span style="color:var(--text-muted)">—</span>'}</td>
        <td>
          <button class="btn-action btn-action-edit" onclick="UsuariosModule.openEdit(${u.id})" title="Editar"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn-action btn-action-delete" onclick="UsuariosModule.confirmDel(${u.id},'${escapeHtml(u.nombre)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
        </td>
      </tr>`).join('');
  },

  _openModal(mode, u = null) {
    const isEdit = mode === 'edit';
    setText('modalUsuarioTitle', isEdit ? 'Editar Usuario' : 'Nuevo Usuario');
    document.getElementById('usuarioId').value = isEdit ? u.id : '';
    document.getElementById('uNombre').value = isEdit ? u.nombre : '';
    document.getElementById('uDni').value = isEdit ? (u.dni||'') : '';
    document.getElementById('uArea').value = isEdit ? (u.area||'') : '';
    document.getElementById('uTurno').value = isEdit ? (u.turno||'') : '';
    clearErrors(['uNombre']);
    openOverlay('modalUsuarioOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/usuarios/${id}`);
      this._openModal('edit', data);
    } catch (e) { showToast(e.message, 'error'); }
  },

  confirmDel(id, name) {
    DeleteModal.open('usuario', id, name, async () => {
      try {
        await http(`/api/usuarios/${id}`, 'DELETE');
        showToast(`"${name}" eliminado`, 'success');
        await this.load();
      } catch (e) { showToast(e.message, 'error'); }
    });
  },

  async _save() {
    clearErrors(['uNombre']);
    if (!document.getElementById('uNombre').value.trim()) { setError('uNombre','err-uNombre','El nombre es requerido'); return; }
    const id = document.getElementById('usuarioId').value;
    const body = {
      nombre: document.getElementById('uNombre').value.trim(),
      dni: document.getElementById('uDni').value.trim() || null,
      area: document.getElementById('uArea').value.trim() || null,
      turno: document.getElementById('uTurno').value || null,
    };
    setLoading('btnSaveUsuario','btnSaveUText','btnSaveUSpinner', true);
    try {
      await http(id ? `/api/usuarios/${id}` : '/api/usuarios', id ? 'PUT' : 'POST', body);
      showToast(`Usuario ${id ? 'actualizado' : 'creado'}`, 'success');
      closeOverlay('modalUsuarioOverlay');
      await this.load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading('btnSaveUsuario','btnSaveUText','btnSaveUSpinner', false); }
  },

  _bindEvents() {
    document.getElementById('btnNuevoUsuario')?.addEventListener('click', () => this._openModal('new'));
    document.getElementById('btnSaveUsuario')?.addEventListener('click', () => this._save());
    document.getElementById('btnCancelUsuario')?.addEventListener('click', () => closeOverlay('modalUsuarioOverlay'));
    document.getElementById('btnCloseModalUsuario')?.addEventListener('click', () => closeOverlay('modalUsuarioOverlay'));
    document.getElementById('btnRefreshUsuarios')?.addEventListener('click', () => this.load());
    document.getElementById('searchUsuario')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      this._render(AppState.usuarios.filter(u =>
        u.nombre.toLowerCase().includes(q) || (u.dni||'').includes(q) || (u.area||'').toLowerCase().includes(q)
      ));
    });
    document.getElementById('modalUsuarioOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalUsuarioOverlay') closeOverlay('modalUsuarioOverlay');
    });
  },
};
