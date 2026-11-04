-- -----------------------------------------------------
-- BD: ClownfishDB
-- VR: 1.0.0
--
-- DESCRIPTION:
-- Esquema inicial para la captura de productos y precios
-- de la competencia desde el formulario de productos.
-- Las unidades de gramaje están normalizadas en su propia
-- tabla catálogo y la fotografía se almacena como URL string.
-- -----------------------------------------------------

CREATE DATABASE IF NOT EXISTS `ClownfishDB`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ClownfishDB`;

-- -----------------------------------------------------
-- Tabla Catálogo: tb_gramaje_units (Unidades de Gramaje)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_gramaje_units` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
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

-- Opciones iniciales de Unidades de Gramaje
INSERT INTO `tb_gramaje_units` (`code`, `label`, `display_order`, `is_active`)
VALUES
  ('g',  'Gramos (g)',      1, 1),
  ('kg', 'Kilogramos (kg)', 2, 1),
  ('ml', 'Mililitros (ml)', 3, 1),
  ('l',  'Litros (L)',      4, 1),
  ('pz', 'Pieza (pz)',      5, 1)
ON DUPLICATE KEY UPDATE
  `label` = VALUES(`label`),
  `display_order` = VALUES(`display_order`),
  `is_active` = VALUES(`is_active`);

-- -----------------------------------------------------
-- Tabla Principal: tb_products
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL COMMENT 'Nombre del producto (input: product_name)',
  `barras` VARCHAR(100) NOT NULL COMMENT 'Código de barras EAN/UPC (input: product_barcode)',
  `precio` DECIMAL(12, 2) NOT NULL COMMENT 'Precio capturado (input: product_price)',
  `gramaje` DECIMAL(12, 3) NOT NULL COMMENT 'Cantidad o peso neto del producto (input: product_weight)',
  `unidad_gramaje_id` INT UNSIGNED NOT NULL COMMENT 'FK hacia tb_gramaje_units.id (input: product_unit)',
  `observaciones` VARCHAR(250) NULL DEFAULT NULL COMMENT 'Notas adicionales, tienda o ubicación (input: product_notes)',
  `foto` VARCHAR(1024) NOT NULL COMMENT 'URL de la fotografía del producto almacenada en bucket/storage (input: product_photo)',
  `oasis_one_user_id` INT NULL DEFAULT NULL COMMENT 'ID del usuario en oasis_one.auth_user que realizó la captura',
  `created_by_username` VARCHAR(150) NULL DEFAULT NULL COMMENT 'Username en oasis_one del usuario que registró el producto',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del registro (1 = Activo, 0 = Eliminado)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  -- Índices para búsquedas, relaciones y filtrado frecuente
  INDEX `idx_tb_products_barras` (`barras`),
  INDEX `idx_tb_products_nombre` (`nombre`),
  INDEX `idx_tb_products_precio` (`precio`),
  INDEX `idx_tb_products_unidad_gramaje` (`unidad_gramaje_id`),
  INDEX `idx_tb_products_user_created` (`oasis_one_user_id`, `created_at`),
  INDEX `idx_tb_products_active_created` (`is_active`, `created_at`),

  -- Relación con el catálogo de unidades de gramaje
  CONSTRAINT `fk_tb_products_unidad_gramaje`
    FOREIGN KEY (`unidad_gramaje_id`)
    REFERENCES `tb_gramaje_units` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
