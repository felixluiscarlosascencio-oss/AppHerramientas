const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [[{ total_herramientas }]] = await db.query('SELECT COUNT(*) AS total_herramientas FROM herramientas');
    const [[{ prestamos_activos }]] = await db.query("SELECT COUNT(*) AS prestamos_activos FROM prestamos WHERE estado_prestamo='activo'");
    const [[{ prestamos_atrasados }]] = await db.query("SELECT COUNT(*) AS prestamos_atrasados FROM prestamos WHERE estado_prestamo='activo' AND fecha_devolucion_esperada < CURRENT_DATE");
    const [[{ total_usuarios }]] = await db.query('SELECT COUNT(*) AS total_usuarios FROM usuarios');
    const [[{ herramientas_disponibles }]] = await db.query("SELECT COUNT(*) AS herramientas_disponibles FROM herramientas WHERE estado='disponible'");

    const [prestamos_recientes] = await db.query(`
      SELECT p.id, u.nombre AS nombre_usuario, h.nombre AS nombre_herramienta,
        DATE_FORMAT(p.fecha_salida,'%Y-%m-%d') AS fecha_salida,
        DATE_FORMAT(p.fecha_devolucion_esperada,'%Y-%m-%d') AS fecha_devolucion_esperada,
        p.estado_prestamo
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id
      JOIN herramientas h ON p.id_herramienta = h.id
      ORDER BY p.id DESC LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        total_herramientas, prestamos_activos, prestamos_atrasados,
        total_usuarios, herramientas_disponibles, prestamos_recientes
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

module.exports = router;
