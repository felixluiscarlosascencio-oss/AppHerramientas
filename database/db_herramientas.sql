-- =============================================
-- BASE DE DATOS: prestamo_herramientas
-- App Préstamo Herramientas - SPA Node.js
-- =============================================

CREATE DATABASE IF NOT EXISTS prestamo_herramientas
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE prestamo_herramientas;

-- ─── 1. CATEGORÍAS ────────────────────────────────────
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 2. PROVEEDORES ───────────────────────────────────
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  razon_social VARCHAR(150) NOT NULL,
  ruc VARCHAR(20),
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 3. USUARIOS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  dni VARCHAR(20) UNIQUE,
  area VARCHAR(100),
  turno VARCHAR(50),
  contrasena VARCHAR(255) NOT NULL DEFAULT '1234',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 4. HERRAMIENTAS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS herramientas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  tipo VARCHAR(100),
  marca VARCHAR(100),
  modelo VARCHAR(100),
  numero_serie VARCHAR(100),
  estado ENUM('disponible','prestada','mantenimiento','dañada') DEFAULT 'disponible',
  ubicacion VARCHAR(100),
  cantidad_total INT DEFAULT 1,
  cantidad_dispo INT DEFAULT 1,
  id_categoria INT,
  id_proveedor INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 5. PRÉSTAMOS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS prestamos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  id_herramienta INT NOT NULL,
  cantidad_pres INT DEFAULT 1,
  fecha_salida DATE NOT NULL,
  fecha_devolucion_esperada DATE NOT NULL,
  motivo VARCHAR(200),
  area_uso VARCHAR(100),
  estado_prestamo ENUM('activo','devuelto','atrasado') DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_herramienta) REFERENCES herramientas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 6. DEVOLUCIONES ──────────────────────────────────
CREATE TABLE IF NOT EXISTS devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_prestamo INT NOT NULL,
  id_usuario INT NOT NULL,
  id_herramienta INT NOT NULL,
  fecha_devo DATE NOT NULL,
  est_herramienta VARCHAR(100),
  observaciones TEXT,
  reporte TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_prestamo) REFERENCES prestamos(id),
  FOREIGN KEY (id_usuario) REFERENCES usuarios(id),
  FOREIGN KEY (id_herramienta) REFERENCES herramientas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 7. MANTENIMIENTOS ────────────────────────────────
CREATE TABLE IF NOT EXISTS mantenimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_herramienta INT NOT NULL,
  tipo_mantenimiento VARCHAR(100),
  descripcion TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  costo DECIMAL(10,2),
  responsable VARCHAR(100),
  estado ENUM('pendiente','en_proceso','completado') DEFAULT 'pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_herramienta) REFERENCES herramientas(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 8. COMPRAS ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_proveedor INT,
  id_herramienta INT,
  cantidad INT DEFAULT 1,
  precio_unitario DECIMAL(10,2),
  fecha_compra DATE,
  numero_factura VARCHAR(50),
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_proveedor) REFERENCES proveedores(id) ON DELETE SET NULL,
  FOREIGN KEY (id_herramienta) REFERENCES herramientas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── DATOS DE EJEMPLO ─────────────────────────────────

INSERT INTO categorias (nombre, descripcion) VALUES
  ('Herramientas Manuales', 'Martillos, destornilladores, llaves, etc.'),
  ('Herramientas Eléctricas', 'Taladros, esmeriles, sierras eléctricas'),
  ('Herramientas de Medición', 'Vernier, cintas métricas, niveles'),
  ('Equipo de Seguridad', 'Cascos, guantes, lentes de protección'),
  ('Equipos de Soldadura', 'Soldadoras, caretas, electrodos'),
  ('Equipos Neumáticos', 'Compresoras, pistolas de aire'),
  ('Herramientas de Corte', 'Sierras, cúter, tijeras industriales'),
  ('Equipos de Elevación', 'Gatas, poleas, tecles');

INSERT INTO proveedores (razon_social, ruc, contacto, telefono, email) VALUES
  ('Ferrelectronics SAC', '20501234567', 'Carlos Mendoza', '01-234-5678', 'ventas@ferrelectronics.com'),
  ('Importaciones Técnicas Perú', '20508765432', 'Ana Torres', '01-345-6789', 'info@imtecperu.com'),
  ('Herramientas Industriales del Sur', '20512345678', 'Roberto Quispe', '054-123456', 'ventas@hisur.pe'),
  ('TecnoHerr EIRL', '20498765432', 'María Flores', '044-987654', 'gerencia@tecnoherr.pe');

INSERT INTO usuarios (nombre, dni, area, turno, contrasena) VALUES
  ('Juan Pérez García', '12345678', 'Producción', 'Mañana', '1234'),
  ('María López Silva', '23456789', 'Mantenimiento', 'Tarde', '1234'),
  ('Carlos Quispe Mamani', '34567890', 'Almacén', 'Mañana', '1234'),
  ('Ana Torres Huanca', '45678901', 'Seguridad', 'Noche', '1234'),
  ('Pedro Flores Ramos', '56789012', 'Producción', 'Tarde', '1234'),
  ('Lucía Vargas Díaz', '67890123', 'Calidad', 'Mañana', '1234');

INSERT INTO herramientas (codigo,nombre,tipo,marca,modelo,numero_serie,estado,ubicacion,cantidad_total,cantidad_dispo,id_categoria,id_proveedor) VALUES
  ('HM-001','Taladro Percutor 750W','Eléctrica','Bosch','GSB 19-2 RE','SN20240001','disponible','Estante A1',3,3,2,1),
  ('HM-002','Esmeril Angular 4.5"','Eléctrica','Dewalt','DWE402','SN20240002','disponible','Estante A2',2,2,2,2),
  ('HM-003','Martillo de Golpe 1kg','Manual','Stanley','51-131','SN20240003','disponible','Caja B1',5,5,1,1),
  ('HM-004','Llave de Corona 17mm','Manual','Bahco','S17','SN20240004','disponible','Caja B2',8,8,1,3),
  ('HM-005','Vernier Digital 150mm','Medición','Mitutoyo','500-196','SN20240005','disponible','Vitrina C1',4,4,3,2),
  ('HM-006','Casco de Seguridad','Seguridad','3M','H-700','SN20240006','disponible','Rack D1',10,10,4,4),
  ('HM-007','Soldadora Inverter 200A','Soldadura','Lincoln','Invertec V205','SN20240007','disponible','Zona E1',2,2,5,2),
  ('HM-008','Compresor 50L 2HP','Neumática','Schulz','CSL 20/50','SN20240008','disponible','Zona F1',1,1,6,3),
  ('HM-009','Sierra Circular 7-1/4"','Corte','Makita','5007MG','SN20240009','disponible','Estante A3',2,2,7,1),
  ('HM-010','Nivel Láser Autonivelante','Medición','Bosch','GLL 2-80 P','SN20240010','disponible','Vitrina C2',2,2,3,1);
