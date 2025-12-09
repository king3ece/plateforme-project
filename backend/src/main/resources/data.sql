-- Seed default TypeProcessus for FDM (if missing)
INSERT INTO type_processus(code, libelle, reference, is_delete, create_date)
SELECT 'FDM','Fiche descriptive de mission', RANDOM_UUID(), FALSE, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM type_processus WHERE code='FDM');

-- Seed a default Validateur for FDM using the default user (user@idstechnologie.com)
INSERT INTO validateurs(ordre, type_processus_id, user_id, reference, is_delete, create_date)
SELECT 1, t.id, u.id, RANDOM_UUID(), FALSE, CURRENT_TIMESTAMP
FROM type_processus t, _users u
WHERE t.code = 'FDM' AND u.email = 'user@idstechnologie.com'
  AND NOT EXISTS (
    SELECT 1 FROM validateurs v WHERE v.type_processus_id = t.id AND v.user_id = u.id
  );
