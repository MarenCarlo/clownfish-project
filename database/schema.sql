-- -----------------------------------------------------
-- BD: ClownfishDB
-- VR: 1.0.0
--
-- DESCRIPTION:
-- Base de Datos para captura de data de productos y precios.
-- -----------------------------------------------------

START TRANSACTION;

CREATE SCHEMA IF NOT EXISTS `ClownfishDB`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ClownfishDB`;

-- -----------------------------------------------------
-- Tabla Catálogo: tb_gramaje_units (Unidades de Gramaje)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_gramaje_units` (
  `id` UUID NOT NULL DEFAULT UUID(),
  `code` VARCHAR(20) NOT NULL COMMENT 'Código corto o abreviatura de la unidad (ej. g, kg, ml, l, pz)',
  `label` VARCHAR(100) NOT NULL COMMENT 'Etiqueta visible en el selector del formulario (ej. Gramos (g))',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Orden de visualización en el select',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico de la opción (1 = Activo, 0 = Inactivo)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_tb_gramaje_units_code` (`code`),
  INDEX `idx_tb_gramaje_units_active_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tb_gramaje_units` (`id`, `code`, `label`, `display_order`, `is_active`)
VALUES
  (UUID(), 'g',  'Gramos (g)',      1, 1),
  (UUID(), 'kg', 'Kilogramos (kg)', 2, 1),
  (UUID(), 'ml', 'Mililitros (ml)', 3, 1),
  (UUID(), 'l',  'Litros (L)',      4, 1),
  (UUID(), 'pz', 'Pieza (pz)',      5, 1)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `display_order` = VALUES(`display_order`),
  `is_active` = VALUES(`is_active`);

-- -----------------------------------------------------
-- Tabla Catálogo: tb_companies (Empresas / Competencia)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_companies` (
  `id` UUID NOT NULL DEFAULT UUID(),
  `code` VARCHAR(50) NOT NULL COMMENT 'Código corto o identificador único de la empresa',
  `label` VARCHAR(150) NOT NULL COMMENT 'Nombre de la empresa visible en el selector (input: product_store)',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico de la empresa (1 = Activo, 0 = Inactivo)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_tb_companies_code` (`code`),
  INDEX `idx_tb_companies_active_label` (`is_active`, `label`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tb_companies` (`id`, `code`, `label`, `is_active`)
VALUES
  (UUID(), 'LTR',          'La Torre', 1),
  (UUID(), 'MDS',      'Maxidespensa', 1),
  (UUID(), 'DFM', 'Despensa Familiar', 1),
  (UUID(), 'PAZ',              'Paiz', 1),
  (UUID(), 'SEB',   'Super el barrio', 1),
  (UUID(), 'SUM',              'Suma', 1)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `is_active` = VALUES(`is_active`);

-- -----------------------------------------------------
-- Tabla Catálogo: tb_departamentos (Departamentos de Guatemala)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_departamentos` (
  `id` UUID NOT NULL DEFAULT UUID(),
  `code` VARCHAR(10) NOT NULL COMMENT 'Código oficial INE/ISO (ej. 18, 19, 20, 21, 22)',
  `nombre` VARCHAR(100) NOT NULL COMMENT 'Nombre oficial del departamento',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Orden de visualización opcional',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico (1 = Activo, 0 = Inactivo)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_tb_departamentos_code` (`code`),
  INDEX `idx_tb_departamentos_nombre` (`nombre`),
  INDEX `idx_tb_departamentos_active_order` (`is_active`, `display_order`, `nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tb_departamentos` (`id`, `code`, `nombre`, `display_order`, `is_active`)
VALUES
  (UUID(), '18', 'Izabal',     1, 1),
  (UUID(), '19', 'Zacapa',     2, 1),
  (UUID(), '20', 'Chiquimula', 3, 1),
  (UUID(), '21', 'Jalapa',     4, 1),
  (UUID(), '22', 'Jutiapa',    5, 1)
ON DUPLICATE KEY UPDATE
  `nombre` = VALUES(`nombre`),
  `display_order` = VALUES(`display_order`),
  `is_active` = VALUES(`is_active`);

-- -----------------------------------------------------
-- Tabla Catálogo: tb_municipios (Municipios de Guatemala)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_municipios` (
  `id` UUID NOT NULL DEFAULT UUID(),
  `departamento_id` UUID NOT NULL COMMENT 'FK hacia tb_departamentos.id',
  `code` VARCHAR(10) NOT NULL COMMENT 'Código oficial INE del municipio (ej. 1901, 1902)',
  `nombre` VARCHAR(150) NOT NULL COMMENT 'Nombre oficial del municipio',
  `display_order` INT NOT NULL DEFAULT 0 COMMENT 'Orden de visualización opcional',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico (1 = Activo, 0 = Inactivo)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `uk_tb_municipios_code` (`code`),
  INDEX `idx_tb_municipios_departamento` (`departamento_id`),
  INDEX `idx_tb_municipios_nombre` (`nombre`),
  INDEX `idx_tb_municipios_active_order` (`is_active`, `display_order`, `nombre`),
  CONSTRAINT `fk_tb_municipios_departamento`
    FOREIGN KEY (`departamento_id`)
    REFERENCES `tb_departamentos` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Tabla Principal: tb_products
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_products` (
  `id` UUID NOT NULL DEFAULT UUID(),
  `nombre` VARCHAR(255) NOT NULL COMMENT 'Nombre del producto (input: product_name)',
  `barras` VARCHAR(100) NOT NULL COMMENT 'Código de barras EAN/UPC (input: product_barcode)',
  `precio` DECIMAL(12, 2) NOT NULL COMMENT 'Precio capturado (input: product_price)',
  `gramaje` DECIMAL(12, 3) NOT NULL COMMENT 'Cantidad o peso neto del producto (input: product_weight)',
  `unidad_gramaje_id` UUID NOT NULL COMMENT 'FK hacia tb_gramaje_units.id (input: product_unit)',
  `empresa_producto_id` UUID NOT NULL COMMENT 'FK hacia tb_companies.id (input: product_store)',
  `departamento_id` UUID NULL DEFAULT NULL COMMENT 'FK hacia tb_departamentos.id (input: product_department)',
  `municipio_id` UUID NULL DEFAULT NULL COMMENT 'FK hacia tb_municipios.id (input: product_municipality)',
  `en_oferta` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el producto está en oferta (1 = En oferta, 0 = Precio regular)',
  `observaciones` VARCHAR(250) NULL DEFAULT NULL COMMENT 'Notas adicionales, tienda o ubicación (input: product_notes)',
  `foto` VARCHAR(1024) NOT NULL COMMENT 'URL de la fotografía del producto almacenada en bucket/storage (input: product_photo)',
  `oasis_one_user_id` INT(11) NULL DEFAULT NULL COMMENT 'ID del usuario en oasis_one.auth_user que realizó la captura',
  `created_by_username` VARCHAR(150) NULL DEFAULT NULL COMMENT 'Username en oasis_one del usuario que registró el producto',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del registro (1 = Activo, 0 = Eliminado)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tb_products_barras` (`barras`),
  INDEX `idx_tb_products_nombre` (`nombre`),
  INDEX `idx_tb_products_precio` (`precio`),
  INDEX `idx_tb_products_unidad_gramaje` (`unidad_gramaje_id`),
  INDEX `idx_tb_products_empresa_producto` (`empresa_producto_id`),
  INDEX `idx_tb_products_departamento` (`departamento_id`),
  INDEX `idx_tb_products_municipio` (`municipio_id`),
  INDEX `idx_tb_products_en_oferta` (`en_oferta`, `created_at`),
  INDEX `idx_tb_products_user_created` (`oasis_one_user_id`, `created_at`),
  INDEX `idx_tb_products_active_created` (`is_active`, `created_at`),
  CONSTRAINT `fk_tb_products_unidad_gramaje`
    FOREIGN KEY (`unidad_gramaje_id`)
    REFERENCES `tb_gramaje_units` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT `fk_tb_products_empresa_producto`
    FOREIGN KEY (`empresa_producto_id`)
    REFERENCES `tb_companies` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT `fk_tb_products_departamento`
    FOREIGN KEY (`departamento_id`)
    REFERENCES `tb_departamentos` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT `fk_tb_products_municipio`
    FOREIGN KEY (`municipio_id`)
    REFERENCES `tb_municipios` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
