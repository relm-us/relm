CREATE TABLE pending_email_verifications (
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(user_id),
  UNIQUE(code)
);