--CREATE TABLE recently_used_attributes (
--    user_id      BIGINT REFERENCES users(id) ON DELETE CASCADE,
--    attribute_id BIGINT REFERENCES attributes(id) ON DELETE CASCADE,
--    used_at      TIMESTAMP NOT NULL DEFAULT now(),
--    PRIMARY KEY (user_id, attribute_id)
--);
INSERT INTO roles (id, name)
VALUES
    (1, 'CANDIDATE'),
    (2, 'RECRUITER'),
    (3, 'ADMIN')
ON CONFLICT (id) DO NOTHING;