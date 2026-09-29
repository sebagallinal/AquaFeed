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
