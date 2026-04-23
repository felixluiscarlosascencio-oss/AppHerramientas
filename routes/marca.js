const express = require("express");
const router = express.Router();
const db = require("../config/db");

//Retorna todas las marcas
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT * FROM marcas ORDER BY nombremarca ASC",
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error al obtener marcas",
      error: err.message,
    });
  }
});

//Buscar por ID
router.get("/:id", async (req, res) => {
  try {
    //params = valor ingresa por la URL
    const idbuscado = req.params.id;
    const [rows] = await db.query("SELECT * FROM marcas WHERE id = ?", [
      idbuscado,
    ]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Marca no encontrada" });
    }

    //STATUS(200) = DEFAULT
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el buscador de marcas marca",
      error: error.message,
    });
  }
});

//guardar
router.post("/", async (req, res) => {
  try {
    //datos de entrada
    const { nombremarca } = req.body; //Extraer el nombre de la marca del cuerpo de la solicitud

    //validacion
    if (!nombremarca || nombremarca.trim() === "") {
      return res
        .status(400)
        .json({
          success: false,
          message: "El nombre de la marca es requerido",
        });
    }

    //insercion
    const [result] = await db.query(
      "INSERT INTO marcas (nombremarca) VALUES (?)",
      [nombremarca],
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Marca creada correctamente",
        id: result.insertId,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el buscador de marcas marca",
      error: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { nombremarca } = req.body;

    //validacion
    if (!nombremarca || nombremarca.trim() === "") {
      return res
        .status(400)
        .json({
          success: false,
          message: "El nombre de la marca es requerido",
        });
    }

    //consulta de actualizacion
    const [result] = await db.query(
      "UPDATE marcas SET nombremarca = ? WHERE id = ?",
      [nombremarca, req.params.id],
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Marca no encontrada" });
    }

    //status = 200 por defecto
    res.json({ success: true, message: "Marca actualizada correctamente" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error en el buscador de marcas marca",
      error: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    //HAce falta una validadcion
    const [productos] = await db.query(
      "SELECT COUNT(*) as total FROM productos WHERE idmarca = ?",
      [req.params.id],
    );

    //COunt = 0, no hay productos asociados a la marca, se puede eliminar
    if (productos[0].total > 0) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "No se puede eliminar la marca porque tiene productos asociados",
          products: productos[0].total,
        });
    }

    const [result] = await db.query("DELETE FROM marcas WHERE id = ?", [
      req.params.id,
    ]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Marca no encontrada" });
    }

    res.json({ success: true, message: "Marca eliminada correctamente" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "No se puede eliminar la marca",
      error: error.message,
    });
  }
});

module.exports = router;