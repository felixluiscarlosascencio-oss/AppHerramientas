const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, dni, area, turno, created_at FROM usuarios ORDER BY id DESC');
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nombre, dni, area, turno, created_at FROM usuarios WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nombre, dni, area, turno } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  try {
    const [result] = await db.query(
      'INSERT INTO usuarios (nombre, dni, area, turno, contrasena) VALUES (?,?,?,?,?)',
      [nombre.trim(), dni||null, area||null, turno||null, '1234']
    );
    res.status(201).json({ success: true, message: 'Usuario creado', id: result.insertId });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: 'El DNI ya está registrado' });
    res.status(500).json({ success: false, message: 'Error al crear', error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nombre, dni, area, turno } = req.body;
  if (!nombre?.trim()) return res.status(400).json({ success: false, message: 'El nombre es requerido' });
  try {
    const [r] = await db.query('SELECT id FROM usuarios WHERE id = ?', [req.params.id]);
    if (!r.length) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    await db.query('UPDATE usuarios SET nombre=?,dni=?,area=?,turno=? WHERE id=?',
      [nombre.trim(), dni||null, area||null, turno||null, req.params.id]);
    res.json({ success: true, message: 'Usuario actualizado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error', error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM usuarios WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    res.json({ success: true, message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error al eliminar', error: err.message });
  }
});

module.exports = router;
