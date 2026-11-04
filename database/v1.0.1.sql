-- -----------------------------------------------------
-- BD: ClownfishDB
-- VR: 1.0.1
--
-- DESCRIPTION:
-- Agrega el campo booleano 'en_oferta' (TINYINT(1))
-- a la tabla 'tb_products' para identificar si el producto
-- se encuentra o no en oferta/descuento, junto con su índice.
-- -----------------------------------------------------

USE `ClownfishDB`;

ALTER TABLE `tb_products`
  ADD COLUMN `en_oferta` TINYINT(1) NOT NULL DEFAULT 0 COMMENT 'Indica si el producto está en oferta (1 = En oferta, 0 = Precio regular)'
  AFTER `empresa_producto_id`;

-- Índice para consultas y filtros por productos en oferta
ALTER TABLE `tb_products`
  ADD INDEX `idx_tb_products_en_oferta` (`en_oferta`, `created_at`);
