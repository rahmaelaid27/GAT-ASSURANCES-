-- ================================================================
-- GAT Assurances — Script d'initialisation base de données
-- À exécuter dans phpMyAdmin → gat_assurances
-- ================================================================

-- 1. Fix colonnes tronquées
ALTER TABLE sinistres MODIFY COLUMN type_sinistre VARCHAR(30);
ALTER TABLE sinistres MODIFY COLUMN statut        VARCHAR(30);
ALTER TABLE missions  MODIFY COLUMN statut        VARCHAR(30);
ALTER TABLE missions  MODIFY COLUMN type_mission  VARCHAR(20);
ALTER TABLE users     MODIFY COLUMN role          VARCHAR(20);

-- 2. Supprimer les anciens users de test pour repartir proprement
DELETE FROM sinistres WHERE 1=1;
DELETE FROM vehicules WHERE 1=1;
DELETE FROM clients   WHERE 1=1;
DELETE FROM missions  WHERE 1=1;
DELETE FROM garages   WHERE 1=1;
DELETE FROM experts   WHERE 1=1;
DELETE FROM remorqueurs WHERE 1=1;
DELETE FROM gestionnaires WHERE 1=1;
DELETE FROM notifications WHERE 1=1;
DELETE FROM users     WHERE 1=1;

-- Réinitialiser les auto-increments
ALTER TABLE sinistres    AUTO_INCREMENT = 1;
ALTER TABLE vehicules    AUTO_INCREMENT = 1;
ALTER TABLE clients      AUTO_INCREMENT = 1;
ALTER TABLE missions     AUTO_INCREMENT = 1;
ALTER TABLE garages      AUTO_INCREMENT = 1;
ALTER TABLE experts      AUTO_INCREMENT = 1;
ALTER TABLE remorqueurs  AUTO_INCREMENT = 1;
ALTER TABLE gestionnaires AUTO_INCREMENT = 1;
ALTER TABLE users        AUTO_INCREMENT = 1;
