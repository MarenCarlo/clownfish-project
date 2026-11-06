-- -----------------------------------------------------
-- BD: ClownfishDB
-- VR: 1.0.3
--
-- DESCRIPTION:
-- 1. Crea la tabla 'tb_product_price_history' para almacenar
--    el historial cronológico de precios y ofertas por producto.
-- 2. Agrega el índice compuesto 'idx_tb_products_4keys' en 'tb_products'
--    para optimizar la validación de las 4 llaves maestras:
--    (barras, empresa_producto_id, departamento_id, municipio_id).
-- -----------------------------------------------------

USE `ClownfishDB`;

START TRANSACTION;

-- -----------------------------------------------------
-- 1. Tabla: tb_product_price_history (Historial de Precios)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `tb_product_price_history` (
  `id` UUID NOT NULL DEFAULT UUID(),
  `product_id` UUID NOT NULL COMMENT 'FK hacia tb_products.id',
  `precio` DECIMAL(12, 2) NOT NULL COMMENT 'Precio registrado en esta toma',
  `en_oferta` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Estado de oferta (1 = En oferta, 0 = Precio regular)',
  `observaciones` VARCHAR(250) NULL DEFAULT NULL COMMENT 'Observaciones de esta captura de precio',
  `oasis_one_user_id` INT(11) NULL DEFAULT NULL COMMENT 'ID del usuario en oasis_one.auth_user',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_tb_price_history_product` (`product_id`, `created_at` DESC),
  INDEX `idx_tb_price_history_user` (`oasis_one_user_id`, `created_at`),
  CONSTRAINT `fk_tb_price_history_product`
    FOREIGN KEY (`product_id`)
    REFERENCES `tb_products` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- 2. Índice compuesto en tb_products para las 4 llaves maestras
-- -----------------------------------------------------
ALTER TABLE `tb_products`
  ADD INDEX `idx_tb_products_4keys` (`barras`, `empresa_producto_id`, `departamento_id`, `municipio_id`, `is_active`);

COMMIT;
