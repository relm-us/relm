-- Appearance data is now saved per user.
ALTER TABLE users
ADD COLUMN appearance JSONB;

-- Create social connections table.
CREATE TABLE login_social_connections (
    user_id UUID NOT NULL,
    connection_type TEXT NOT NULL,
    profile_id TEXT NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(user_id)
);

-- Modify existing user table to allow storing passwords and ensure the email cannot be not null.
ALTER TABLE users
ADD COLUMN password_hash TEXT;

ALTER TABLE users
ALTER COLUMN email SET NOT NULL;

ALTER TABLE users
ADD CONSTRAINT unique_email UNIQUE(email);