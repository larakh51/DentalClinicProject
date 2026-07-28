ALTER TABLE appointments
  MODIFY COLUMN treatment_type VARCHAR(150)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    NOT NULL,
  MODIFY COLUMN treatment_type_id VARCHAR(50)
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci
    NULL DEFAULT NULL;

ALTER TABLE invoices
  MODIFY COLUMN status
    ENUM('paid', 'pending', 'overdue', 'unpaid', 'partial')
    NOT NULL;

UPDATE invoices
SET status = 'unpaid'
WHERE status = '';
