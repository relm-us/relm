ALTER TABLE login_social_connections
ADD CONSTRAINT unique_user_connection UNIQUE(user_id, connection_type);