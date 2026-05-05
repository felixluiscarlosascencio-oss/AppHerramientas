const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, c.nombre AS nombre_categoria, p.razon_social AS nombre_proveedor
      FROM herramientas h
      LEFT JOIN categorias c ON h.id_categoria = c.id
      LEFT JOIN proveedores p ON h.id_proveedor = p.id
      ORDER BY h.id DESC
    `);
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al obtener herramientas', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT h.*, c.nombre AS nombre_categoria, p.razon_social AS nombre_proveedor
      FROM herramientas h
      LEFT JOIN categorias c ON h.id_categoria = c.id
      LEFT JOIN proveedores p ON h.id_proveedor = p.id
      WHERE h.id = ?
    `, [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Herramienta no encontrada' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { codigo, nombre, tipo, marca, modelo, numero_serie, estado, ubicacion, cantidad_total, id_categoria, id_proveedor } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  if (!codigo?.trim()) return res.status(400).json({ success: false, message: 'El código es requerido' });
  try {
    const [result] = await db.query(
      'INSERT INTO herramientas (codigo,nombre,tipo,marca,modelo,numero_serie,estado,ubicacion,cantidad_total,cantidad_dispo,id_categoria,id_proveedor) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
      [codigo.trim(), nombre.trim(), tipo||null, marca||null, modelo||null, numero_serie||null,
       estado||'disponible', ubicacion||null, parseInt(cantidad_total)||1, parseInt(cantidad_total)||1, id_categoria||null, id_proveedor||null]
    );
    res.status(201).json({ success: true, message: 'Herramienta creada', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'El código ya existe' });
    res.status(500).json({ success: false, message: 'Error al crear', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { codigo, nombre, tipo, marca, modelo, numero_serie, estado, ubicacion, cantidad_total, id_categoria, id_proveedor } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  try {
    const [r] = await db.query('SELECT id FROM herramientas WHERE id = ?', [req.params.id]);
    if (!r.length) return res.status(404).json({ success: false, message: 'Herramienta no encontrada' });
    await db.query(
      'UPDATE herramientas SET codigo=?,nombre=?,tipo=?,marca=?,modelo=?,numero_serie=?,estado=?,ubicacion=?,cantidad_total=?,id_categoria=?,id_proveedor=? WHERE id=?',
      [codigo?.trim()||null, nombre.trim(), tipo||null, marca||null, modelo||null, numero_serie||null,
       estado||'disponible', ubicacion||null, parseInt(cantidad_total)||1, id_categoria||null, id_proveedor||null, req.params.id]
    );
    res.json({ success: true, message: 'Herramienta actualizada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al actualizar', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM herramientas WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Herramienta no encontrada' });
    res.json({ success: true, message: 'Herramienta eliminada' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar', error: err.message });
  }
});

module.exports = router;
