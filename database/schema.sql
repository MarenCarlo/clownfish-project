-- -----------------------------------------------------
-- BD: ClownfishDB
-- VR: 1.0.0
--
-- DESCRIPTION:
-- Esquema inicial para la captura de productos y precios
-- de la competencia desde el formulario de productos.
-- La fotografía del producto se almacena como URL (VARCHAR).
-- -----------------------------------------------------

CREATE DATABASE IF NOT EXISTS `ClownfishDB`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `ClownfishDB`;

-- -----------------------------------------------------
-- Tabla: tb_products
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_products` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL COMMENT 'Nombre del producto (input: product_name)',
  `barras` VARCHAR(100) NOT NULL COMMENT 'Código de barras EAN/UPC (input: product_barcode)',
  `precio` DECIMAL(12, 2) NOT NULL COMMENT 'Precio capturado (input: product_price)',
  `gramaje` DECIMAL(12, 3) NOT NULL COMMENT 'Cantidad o peso neto del producto (input: product_weight)',
  `unidad_gramaje` ENUM('g', 'kg', 'ml', 'l', 'pz') NOT NULL DEFAULT 'g' COMMENT 'Unidad de medida del gramaje (input: product_unit)',
  `observaciones` VARCHAR(250) NULL DEFAULT NULL COMMENT 'Notas adicionales, tienda o ubicación (input: product_notes)',
  `foto` VARCHAR(1024) NOT NULL COMMENT 'URL de la fotografía del producto almacenada en bucket/storage (input: product_photo)',
  `oasis_one_user_id` INT NULL DEFAULT NULL COMMENT 'ID del usuario en oasis_one.auth_user que realizó la captura',
  `created_by_username` VARCHAR(150) NULL DEFAULT NULL COMMENT 'Username en oasis_one del usuario que registró el producto',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1 COMMENT 'Estado lógico del registro (1 = Activo, 0 = Eliminado)',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),

  -- Índices para búsquedas y filtrado frecuente
  INDEX `idx_tb_products_barras` (`barras`),
  INDEX `idx_tb_products_nombre` (`nombre`),
  INDEX `idx_tb_products_precio` (`precio`),
  INDEX `idx_tb_products_user_created` (`oasis_one_user_id`, `created_at`),
  INDEX `idx_tb_products_active_created` (`is_active`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
