CREATE DATABASE IF NOT EXISTS sanmarcos_usuarios;
CREATE DATABASE IF NOT EXISTS sanmarcos_reservas;
CREATE DATABASE IF NOT EXISTS sanmarcos_profesionales;
CREATE DATABASE IF NOT EXISTS sanmarcos_contacto;
CREATE DATABASE IF NOT EXISTS sanmarcos_servicios;
CREATE DATABASE IF NOT EXISTS sanmarcos_farmacia;

GRANT ALL PRIVILEGES ON sanmarcos_usuarios.* TO 'sanmarcos'@'%';
GRANT ALL PRIVILEGES ON sanmarcos_reservas.* TO 'sanmarcos'@'%';
GRANT ALL PRIVILEGES ON sanmarcos_profesionales.* TO 'sanmarcos'@'%';
GRANT ALL PRIVILEGES ON sanmarcos_contacto.* TO 'sanmarcos'@'%';
GRANT ALL PRIVILEGES ON sanmarcos_servicios.* TO 'sanmarcos'@'%';
GRANT ALL PRIVILEGES ON sanmarcos_farmacia.* TO 'sanmarcos'@'%';