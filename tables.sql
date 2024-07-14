CREATE TYPE roles_enum AS ENUM ('user', 'admin', 'super_admin');

CREATE TABLE "user" (
  id SERIAL PRIMARY KEY,
  "name" VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  "password" VARCHAR(255) NOT NULL,
  "role" roles_enum DEFAULT 'user',
  verification_code VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(email)
);

CREATE TABLE login_logs (
  user_id INTEGER REFERENCES "user"(id) ON DELETE CASCADE,
  "date" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX user_role_cluster_index ON "user"("role");

CLUSTER "user" USING user_role_cluster_index;

ALTER TABLE "user" SET (autovacuum_enabled = true);
