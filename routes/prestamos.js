const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.nombre AS nombre_usuario, h.nombre AS nombre_herramienta, h.codigo AS codigo_herramienta,
        DATE_FORMAT(p.fecha_salida,'%Y-%m-%d') AS fecha_salida,
        DATE_FORMAT(p.fecha_devolucion_esperada,'%Y-%m-%d') AS fecha_devolucion_esperada
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id
      JOIN herramientas h ON p.id_herramienta = h.id
      ORDER BY p.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT p.*, u.nombre AS nombre_usuario, h.nombre AS nombre_herramienta,
        DATE_FORMAT(p.fecha_salida,'%Y-%m-%d') AS fecha_salida,
        DATE_FORMAT(p.fecha_devolucion_esperada,'%Y-%m-%d') AS fecha_devolucion_esperada
      FROM prestamos p
      JOIN usuarios u ON p.id_usuario = u.id
      JOIN herramientas h ON p.id_herramienta = h.id
      WHERE p.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { id_usuario, id_herramienta, cantidad_pres, fecha_salida, fecha_devolucion_esperada, motivo, area_uso } = req.body;
  if (!id_usuario) return res.status(400).json({ success: false, message: 'El usuario es requerido' });
  if (!id_herramienta) return res.status(400).json({ success: false, message: 'La herramienta es requerida' });
  if (!fecha_salida) return res.status(400).json({ success: false, message: 'La fecha de salida es requerida' });
  if (!fecha_devolucion_esperada) return res.status(400).json({ success: false, message: 'La fecha de devolución es requerida' });
  try {
    const [h] = await db.query('SELECT cantidad_dispo FROM herramientas WHERE id = ?', [id_herramienta]);
    if (!h.length) return res.status(404).json({ success: false, message: 'Herramienta no encontrada' });
    if (h[0].cantidad_dispo < (parseInt(cantidad_pres)||1))
      return res.status(400).json({ success: false, message: 'Stock insuficiente' });

    const [result] = await db.query(
      'INSERT INTO prestamos (id_usuario,id_herramienta,cantidad_pres,fecha_salida,fecha_devolucion_esperada,motivo,area_uso) VALUES (?,?,?,?,?,?,?)',
      [id_usuario, id_herramienta, parseInt(cantidad_pres)||1, fecha_salida, fecha_devolucion_esperada, motivo||null, area_uso||null]
    );
    await db.query('UPDATE herramientas SET cantidad_dispo = cantidad_dispo - ?, estado = IF(cantidad_dispo - ? <= 0, "prestada", estado) WHERE id = ?',
      [parseInt(cantidad_pres)||1, parseInt(cantidad_pres)||1, id_herramienta]);
    res.status(201).json({ success: true, message: 'Préstamo registrado', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al crear préstamo', error: err.message });
  }
});

router.put('/:id/devolver', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM prestamos WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
    const p = rows[0];
    if (p.estado_prestamo === 'devuelto') return res.status(400).json({ success: false, message: 'El préstamo ya fue devuelto' });

    await db.query("UPDATE prestamos SET estado_prestamo='devuelto' WHERE id=?", [req.params.id]);
    await db.query('UPDATE herramientas SET cantidad_dispo = cantidad_dispo + ?, estado = "disponible" WHERE id = ?',
      [p.cantidad_pres, p.id_herramienta]);

    const { observaciones, est_herramienta } = req.body;
    await db.query(
      'INSERT INTO devoluciones (id_prestamo,id_usuario,id_herramienta,fecha_devo,est_herramienta,observaciones) VALUES (?,?,?,CURRENT_DATE,?,?)',
      [req.params.id, p.id_usuario, p.id_herramienta, est_herramienta||'bueno', observaciones||null]
    );
    res.json({ success: true, message: 'Devolución registrada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM prestamos WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Préstamo no encontrado' });
    res.json({ success: true, message: 'Préstamo eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

module.exports = router;
