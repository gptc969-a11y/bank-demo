CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  email_verified INTEGER DEFAULT 0,
  kyc_status TEXT DEFAULT 'unverified',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT UNIQUE REFERENCES users(id),
  account_number TEXT UNIQUE,
  balance_cents INTEGER DEFAULT 100000,
  currency TEXT DEFAULT 'USD'
);

CREATE TABLE verification_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id),
  expires_at DATETIME NOT NULL
);

CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  from_account_id TEXT REFERENCES accounts(id),
  to_account_id TEXT REFERENCES accounts(id),
  amount_cents INTEGER NOT NULL,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);