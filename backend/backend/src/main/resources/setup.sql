-- Configuration de la base de données BusLocator
CREATE DATABASE IF NOT EXISTS buslocator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Facultatif : Création d'un utilisateur dédié (si nécessaire)
-- CREATE USER 'bususer'@'localhost' IDENTIFIED BY 'buspassword';
-- GRANT ALL PRIVILEGES ON buslocator.* TO 'bususer'@'localhost';
-- FLUSH PRIVILEGES;

USE buslocator;

-- Note : Les tables seront créées automatiquement par Spring Boot 
-- grâce à la propriété spring.jpa.hibernate.ddl-auto=update dans application.properties.
