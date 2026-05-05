'use strict';

const AppState = {
  herramientas: [],
  categorias: [],
  proveedores: [],
  usuarios: [],
  prestamos: [],
  devoluciones: [],
  deleteTarget: { type: null, id: null, name: null, onConfirm: null },
};

const DeleteModal = {
  render() {
    document.getElementById('modalsContainer').innerHTML = `
      <div class="modal-overlay" id="modalDeleteOverlay">
        <div class="modal-panel modal-sm">
          <div class="modal-header-custom">
            <div class="modal-title-custom text-danger">
              <i class="bi bi-exclamation-triangle-fill me-2"></i>Confirmar Eliminación
            </div>
            <button class="btn-modal-close" id="btnCloseDelete"><i class="bi bi-x-lg"></i></button>
          </div>
          <div class="modal-body-custom">
            <p class="text-muted mb-0" id="deleteMessage">¿Estás seguro de que deseas eliminar este registro?</p>
          </div>
          <div class="modal-footer-custom">
            <button class="btn-cancel" id="btnCancelDelete">Cancelar</button>
            <button class="btn-danger-action" id="btnConfirmDelete">
              <i class="bi bi-trash3-fill me-1"></i> Eliminar
            </button>
          </div>
        </div>
      </div>`;

    document.getElementById('btnConfirmDelete').addEventListener('click', () => this._execute());
    document.getElementById('btnCancelDelete').addEventListener('click', () => closeOverlay('modalDeleteOverlay'));
    document.getElementById('btnCloseDelete').addEventListener('click', () => closeOverlay('modalDeleteOverlay'));
    document.getElementById('modalDeleteOverlay').addEventListener('click', e => {
      if (e.target.id === 'modalDeleteOverlay') closeOverlay('modalDeleteOverlay');
    });
  },

  open(type, id, name, onConfirm) {
    AppState.deleteTarget = { type, id, name, onConfirm };
    const msgs = {
      herramienta: `¿Eliminar la herramienta "<strong>${escapeHtml(name)}</strong>"? Esta acción no se puede deshacer.`,
      categoria: `¿Eliminar la categoría "<strong>${escapeHtml(name)}</strong>"?`,
      proveedor: `¿Eliminar el proveedor "<strong>${escapeHtml(name)}</strong>"?`,
      usuario: `¿Eliminar el usuario "<strong>${escapeHtml(name)}</strong>"?`,
      prestamo: `¿Eliminar el préstamo de "<strong>${escapeHtml(name)}</strong>"?`,
    };
    document.getElementById('deleteMessage').innerHTML = msgs[type] || '¿Confirmar eliminación?';
    openOverlay('modalDeleteOverlay');
  },

  async _execute() {
    const { onConfirm } = AppState.deleteTarget;
    closeOverlay('modalDeleteOverlay');
    if (typeof onConfirm === 'function') await onConfirm();
  },
};

function updateBadges() {
  setText('badge-herramientas', AppState.herramientas.length);
  setText('badge-categorias',   AppState.categorias.length);
  setText('badge-prestamos',    AppState.prestamos.length);
  setText('badge-devoluciones', AppState.devoluciones.length);
  setText('badge-usuarios',     AppState.usuarios.length);
  setText('badge-proveedores',  AppState.proveedores.length);
}

document.addEventListener('DOMContentLoaded', () => {
  DeleteModal.render();
  Router.init();
  Router.navigateTo('dashboard');
});
