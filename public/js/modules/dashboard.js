'use strict';

const DashboardModule = {
  async init() {
    try {
      const { data } = await http('/api/dashboard');
      setText('statHerramientas', data.total_herramientas);
      setText('statDisponibles', data.herramientas_disponibles);
      setText('statActivos', data.prestamos_activos);
      setText('statAtrasados', data.prestamos_atrasados);

      const tbody = document.getElementById('bodyDashboard');
      if (!data.prestamos_recientes.length) {
        tbody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="bi bi-inbox"></i><p>No hay préstamos recientes</p></div></td></tr>`;
        return;
      }
      const estadoBadge = {
        activo: '<span style="background:rgba(245,158,11,.12);color:#d97706;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">Activo</span>',
        devuelto: '<span style="background:rgba(16,185,129,.12);color:#059669;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">Devuelto</span>',
        atrasado: '<span style="background:rgba(239,68,68,.12);color:#dc2626;padding:2px 10px;border-radius:20px;font-size:12px;font-weight:600">Atrasado</span>',
      };
      tbody.innerHTML = data.prestamos_recientes.map((p, i) => `
        <tr>
          <td><span style="font-family:'DM Mono',monospace;font-size:12px;color:var(--text-muted)">${String(i+1).padStart(2,'0')}</span></td>
          <td>${escapeHtml(p.nombre_usuario)}</td>
          <td>${escapeHtml(p.nombre_herramienta)}</td>
          <td>${formatFecha(p.fecha_salida)}</td>
          <td>${formatFecha(p.fecha_devolucion_esperada)}</td>
          <td>${estadoBadge[p.estado_prestamo] || p.estado_prestamo}</td>
        </tr>`).join('');
    } catch (e) {
      showToast('Error al cargar dashboard: ' + e.message, 'error');
    }
  }
};
