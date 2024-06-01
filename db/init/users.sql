CREATE SCHEMA IF NOT EXISTS users;

CREATE TABLE IF NOT EXISTS users.users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    pwd VARCHAR(255) NOT NULL,
    email VARCHAR(50) UNIQUE NOT NULL,
    roles VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users.refresh_tokens (
    token_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users.users(user_id) ON DELETE CASCADE
);

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();  -- Ensure the timestamp is updated to the current time
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
ON users.users FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_refresh_tokens_updated_at BEFORE UPDATE
ON users.refresh_tokens FOR EACH ROW
EXECUTE PROCEDURE update_modified_column();
