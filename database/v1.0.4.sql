-- -----------------------------------------------------
-- BD: ClownfishDB
-- VR: 1.0.4
--
-- DESCRIPTION:
-- Optimización para tratamiento de datos masivos:
-- 1. Elimina el índice redundante 'idx_tb_products_barras'
--    (ya cubierto como prefijo izquierdo por la llave compuesta).
-- 2. Convierte el índice de las 4 llaves maestras a UNIQUE KEY 'uk_tb_products_4keys'
--    para evitar duplicados por condiciones de carrera a nivel de motor de almacenamiento.
-- 3. Agrega índice FULLTEXT 'ft_tb_products_nombre' en 'tb_products'
--    para habilitar búsquedas ultrarrápidas de texto en catálogos extensos.
-- -----------------------------------------------------

USE `ClownfishDB`;

START TRANSACTION;

-- 1. Eliminar índice redundante de código de barras
ALTER TABLE `tb_products`
  DROP INDEX `idx_tb_products_barras`;

-- 2. Reemplazar índice regular de 4 llaves por UNIQUE KEY para integridad estricta
ALTER TABLE `tb_products`
  DROP INDEX IF EXISTS `idx_tb_products_4keys`,
  ADD UNIQUE INDEX `uk_tb_products_4keys` (`barras`, `empresa_producto_id`, `departamento_id`, `municipio_id`);

-- 3. Agregar índice FULLTEXT para búsquedas eficientes por nombre de producto
ALTER TABLE `tb_products`
  ADD FULLTEXT INDEX `ft_tb_products_nombre` (`nombre`);

COMMIT;
