-- Esquema de AquaFeed (MariaDB / MySQL). Idempotente: se aplica al iniciar el backend.
-- Todas las fechas se guardan en UTC.

CREATE TABLE IF NOT EXISTS dispositivos (
  id         VARCHAR(32)  NOT NULL PRIMARY KEY,   -- el mismo id que usa el topic aquafeed/{id}/...
  nombre     VARCHAR(100) NOT NULL,
  creado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS usuarios (
  id              INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  username        VARCHAR(50)  NOT NULL UNIQUE,
  email           VARCHAR(100) NOT NULL UNIQUE,
  password_hash   VARCHAR(100) NOT NULL,
  rol             ENUM('admin','user') NOT NULL DEFAULT 'user',
  nombre          VARCHAR(100) NOT NULL,
  dispositivo_id  VARCHAR(32)  NULL,
  creado_en       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_usuarios_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Frontend nuevo: un dispositivo (pecera) tiene un solo dueño y un usuario puede tener varias.
-- usuarios.dispositivo_id queda para la API anterior. Sin FK a usuarios para no cruzar las dos tablas.
ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS usuario_id INT NULL AFTER nombre;
ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS especie_id VARCHAR(64) NULL AFTER usuario_id;  -- id del perfil de especie
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo TINYINT(1) NOT NULL DEFAULT 1 AFTER nombre;

CREATE TABLE IF NOT EXISTS lecturas_agua (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dispositivo_id  VARCHAR(32)  NOT NULL,
  temp_agua       DECIMAL(5,2) NULL,
  ph              DECIMAL(4,2) NULL,
  minerales       DECIMAL(6,2) NULL,
  registrado_en   DATETIME(3)  NOT NULL,
  INDEX idx_agua_disp_fecha (dispositivo_id, registrado_en),
  CONSTRAINT fk_agua_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- TDS en ppm (firmware v1). "minerales" queda para las lecturas del firmware anterior.
ALTER TABLE lecturas_agua ADD COLUMN IF NOT EXISTS tds_ppm DECIMAL(7,2) NULL AFTER minerales;

CREATE TABLE IF NOT EXISTS lecturas_ambiente (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dispositivo_id  VARCHAR(32)  NOT NULL,
  temp_amb        DECIMAL(5,2) NULL,
  hum_amb         DECIMAL(5,2) NULL,
  registrado_en   DATETIME(3)  NOT NULL,
  INDEX idx_amb_disp_fecha (dispositivo_id, registrado_en),
  CONSTRAINT fk_amb_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alimentaciones (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dispositivo_id  VARCHAR(32)  NOT NULL,
  origen          ENUM('web','boton') NOT NULL,   -- web: desde la app; boton: botón físico del ESP32
  usuario_id      INT          NULL,              -- quién la pidió (solo origen web)
  registrado_en   DATETIME(3)  NOT NULL,
  INDEX idx_alim_disp_fecha (dispositivo_id, registrado_en),
  CONSTRAINT fk_alim_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id),
  CONSTRAINT fk_alim_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Calendario de alimentación. El backend versiona la lista completa y la publica retenida en
-- aquafeed/v1/{id}/config; el ESP32 la guarda en memoria y la ejecuta solo, aunque no tenga red.
-- dias: días ISO separados por coma (1 = lunes … 7 = domingo). hora: HH:MM en hora de la pecera.
CREATE TABLE IF NOT EXISTS horarios (
  id              INT          NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dispositivo_id  VARCHAR(32)  NOT NULL,
  dias            VARCHAR(20)  NOT NULL,
  hora            CHAR(5)      NOT NULL,
  porciones       TINYINT      NOT NULL,
  activo          TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_horarios_disp (dispositivo_id),
  CONSTRAINT fk_horarios_dispositivo FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

ALTER TABLE dispositivos ADD COLUMN IF NOT EXISTS config_version INT NOT NULL DEFAULT 0 AFTER especie_id;

-- programada: la ejecutó el ESP32 según el calendario. porciones: NULL en registros anteriores.
ALTER TABLE alimentaciones MODIFY COLUMN origen ENUM('web','boton','programada') NOT NULL;
ALTER TABLE alimentaciones ADD COLUMN IF NOT EXISTS porciones TINYINT NULL AFTER origen;

-- Alertas configurables por pecera. Un límite en NULL no se controla.
-- offline_min: minutos sin telemetría para avisar que se desconectó (NULL = no avisar).
CREATE TABLE IF NOT EXISTS config_alertas (
  dispositivo_id  VARCHAR(32)  NOT NULL PRIMARY KEY,
  temp_min        DECIMAL(5,2) NULL,
  temp_max        DECIMAL(5,2) NULL,
  ph_min          DECIMAL(4,2) NULL,
  ph_max          DECIMAL(4,2) NULL,
  tds_min         DECIMAL(7,2) NULL,
  tds_max         DECIMAL(7,2) NULL,
  offline_min     SMALLINT     NULL DEFAULT 10,
  actualizado_en  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_config_alertas_disp FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- abierta: pasa ahora y nadie la vio · reconocida: el usuario la vio pero sigue pasando ·
-- cerrada: se normalizó sola. Por pecera y tipo hay como mucho una alerta no cerrada.
CREATE TABLE IF NOT EXISTS alertas (
  id              BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
  dispositivo_id  VARCHAR(32)  NOT NULL,
  tipo            ENUM('parametro','offline') NOT NULL,
  parametro       ENUM('waterTempC','ph','tdsPpm') NULL,
  estado          ENUM('abierta','reconocida','cerrada') NOT NULL DEFAULT 'abierta',
  mensaje         VARCHAR(255) NOT NULL,
  valor           DECIMAL(8,2) NULL,
  abierta_en      DATETIME(3)  NOT NULL,
  reconocida_en   DATETIME(3)  NULL,
  cerrada_en      DATETIME(3)  NULL,
  INDEX idx_alertas_disp_estado (dispositivo_id, estado),
  CONSTRAINT fk_alertas_disp FOREIGN KEY (dispositivo_id) REFERENCES dispositivos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
