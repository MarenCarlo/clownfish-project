-- -----------------------------------------------------
-- BD: ClownfishDB
-- VR: 1.0.2
--
-- DESCRIPTION:
-- 1. Crea la tabla catálogo 'tb_departamentos' con UUID nativo
--    e inserta los 5 departamentos iniciales de Oriente:
--    (Izabal, Zacapa, Chiquimula, Jalapa, Jutiapa).
-- 2. Crea la tabla catálogo 'tb_municipios' con UUID nativo
--    vinculada por FK hacia 'tb_departamentos'.
-- 3. Agrega las columnas 'departamento_id' y 'municipio_id'
--    a la tabla 'tb_products' con sus respectivos índices y llaves foráneas.
-- -----------------------------------------------------

USE `ClownfishDB`;

START TRANSACTION;

-- -----------------------------------------------------
-- 1. Tabla Catálogo: tb_departamentos
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

-- Insertar los 5 departamentos iniciales de Oriente
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
-- 2. Tabla Catálogo: tb_municipios
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
-- 3. Modificaciones en tb_products
-- -----------------------------------------------------
ALTER TABLE `tb_products`
  ADD COLUMN `departamento_id` UUID NULL DEFAULT NULL COMMENT 'FK hacia tb_departamentos.id' AFTER `empresa_producto_id`,
  ADD COLUMN `municipio_id` UUID NULL DEFAULT NULL COMMENT 'FK hacia tb_municipios.id' AFTER `departamento_id`;

ALTER TABLE `tb_products`
  ADD INDEX `idx_tb_products_departamento` (`departamento_id`),
  ADD INDEX `idx_tb_products_municipio` (`municipio_id`);

ALTER TABLE `tb_products`
  ADD CONSTRAINT `fk_tb_products_departamento`
    FOREIGN KEY (`departamento_id`)
    REFERENCES `tb_departamentos` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_tb_products_municipio`
    FOREIGN KEY (`municipio_id`)
    REFERENCES `tb_municipios` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE;

COMMIT;
