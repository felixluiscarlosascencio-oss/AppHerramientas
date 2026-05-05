'use strict';

const CategoriasModule = {
  async init() {
    this._bindEvents();
    await this.load();
  },

  async load() {
    document.getElementById('bodyCategorias').innerHTML =
      `<tr><td colspan="4" class="text-center py-5"><div class="spinner-custom"></div></td></tr>`;
    try {
      const { data } = await http('/api/categorias');
      AppState.categorias = data;
      this._render(data);
      updateBadges();
    } catch (e) {
      showToast('Error al cargar categorías: ' + e.message, 'error');
    }
  },

  _render(lista) {
    setText('totalCategoriasLabel', `${lista.length} categoría(s) encontrada(s)`);
    const tbody = document.getElementById('bodyCategorias');
    if (!lista.length) {
      tbody.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="bi bi-tags"></i><p>No hay categorías</p></div></td></tr>`;
      return;
    }
    tbody.innerHTML = lista.map((c, i) => `
      <tr>
        <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
        <td><strong>${escapeHtml(c.nombre)}</strong></td>
        <td style="color:var(--text-muted);font-size:13px">${escapeHtml(c.descripcion || '—')}</td>
        <td>
          <button class="btn-action btn-action-edit" onclick="CategoriasModule.openEdit(${c.id})" title="Editar"><i class="bi bi-pencil-fill"></i></button>
          <button class="btn-action btn-action-delete" onclick="CategoriasModule.confirmDel(${c.id},'${escapeHtml(c.nombre)}')" title="Eliminar"><i class="bi bi-trash3-fill"></i></button>
        </td>
      </tr>`).join('');
  },

  _openModal(mode, cat = null) {
    const isEdit = mode === 'edit';
    setText('modalCategoriaTitle', isEdit ? 'Editar Categoría' : 'Nueva Categoría');
    setText('modalCategoriaSubtitle', isEdit ? `Editando: ${cat.nombre}` : 'Completa los campos');
    document.getElementById('categoriaId').value = isEdit ? cat.id : '';
    document.getElementById('cNombre').value = isEdit ? cat.nombre : '';
    document.getElementById('cDescripcion').value = isEdit ? (cat.descripcion || '') : '';
    clearErrors(['cNombre']);
    openOverlay('modalCategoriaOverlay');
  },

  async openEdit(id) {
    try {
      const { data } = await http(`/api/categorias/${id}`);
      this._openModal('edit', data);
    } catch (e) { showToast(e.message, 'error'); }
  },

  confirmDel(id, name) {
    DeleteModal.open('categoria', id, name, async () => {
      try {
        await http(`/api/categorias/${id}`, 'DELETE');
        showToast(`"${name}" eliminada`, 'success');
        await this.load();
      } catch (e) { showToast(e.message, 'error'); }
    });
  },

  async _save() {
    clearErrors(['cNombre']);
    if (!document.getElementById('cNombre').value.trim()) {
      setError('cNombre', 'err-cNombre', 'El nombre es requerido');
      return;
    }
    const id = document.getElementById('categoriaId').value;
    const body = {
      nombre: document.getElementById('cNombre').value.trim(),
      descripcion: document.getElementById('cDescripcion').value.trim() || null,
    };
    setLoading('btnSaveCategoria','btnSaveCText','btnSaveCSpinner', true);
    try {
      await http(id ? `/api/categorias/${id}` : '/api/categorias', id ? 'PUT' : 'POST', body);
      showToast(`Categoría ${id ? 'actualizada' : 'creada'}`, 'success');
      closeOverlay('modalCategoriaOverlay');
      await this.load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading('btnSaveCategoria','btnSaveCText','btnSaveCSpinner', false); }
  },

  _bindEvents() {
    document.getElementById('btnNuevaCategoria')?.addEventListener('click', () => this._openModal('new'));
    document.getElementById('btnSaveCategoria')?.addEventListener('click', () => this._save());
    document.getElementById('btnCancelCategoria')?.addEventListener('click', () => closeOverlay('modalCategoriaOverlay'));
    document.getElementById('btnCloseModalCategoria')?.addEventListener('click', () => closeOverlay('modalCategoriaOverlay'));
    document.getElementById('btnRefreshCategorias')?.addEventListener('click', () => this.load());
    document.getElementById('searchCategoria')?.addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      this._render(AppState.categorias.filter(c => c.nombre.toLowerCase().includes(q)));
    });
    document.getElementById('modalCategoriaOverlay')?.addEventListener('click', e => {
      if (e.target.id === 'modalCategoriaOverlay') closeOverlay('modalCategoriaOverlay');
    });
  },
};
