# Database Design

## Schema Overview

The database consists of five primary tables modeling users, securities, transactions, holdings, and historical prices.

## Entity Relationship Diagram

```
┌─────────────────────────────┐
│           USERS             │
├─────────────────────────────┤
│ id              PK          │
│ name            VARCHAR(255)│
│ email           UK VARCHAR  │
│ email_verified_at TIMESTAMP │
│ password        VARCHAR(255)│
│ role            ENUM        │
│ balance         DECIMAL     │
│ is_active       BOOLEAN     │
│ remember_token  VARCHAR(100)│
│ created_at      TIMESTAMP   │
│ updated_at      TIMESTAMP   │
└──────────────┬──────────────┘
               │
       ┌───────┼─────────────────────┐
       │       │                     │
       │ 1     │ 1                   │ 1
       │       │                     │
       │ N     │ N                   │
       │       │                     │
       ▼       ▼                     ▼
┌──────────────────┐  ┌────────────────────┐
│  TRANSACTIONS    │  │     PORTFOLIOS     │
├──────────────────┤  ├────────────────────┤
│ id          PK   │  │ id            PK   │
│ user_id     FK   │  │ user_id       FK   │
│ stock_id    FK   │  │ stock_id      FK   │
│ type        ENUM │  │ quantity      INT  │
│ quantity    INT  │  │ avg_price     DEC  │
│ price       DEC  │  │ created_at    TS   │
│ total       DEC  │  │ updated_at    TS   │
│ fee         DEC  │  │ UNIQUE(user, stock)│
│ status      ENUM │  └────────┬───────────┘
│ executed_at TS   │           │
│ created_at  TS   │           │ N
│ updated_at  TS   │           │
└──────────┬───────┘           │
           │                   │
           │ N                 │ 1
           │                   │
           ▼                   ▼
┌──────────────────────────────────────────┐
│              STOCKS                      │
├──────────────────────────────────────────┤
│ id              PK                       │
│ symbol          UK VARCHAR(10)           │
│ company_name    VARCHAR(255)             │
│ sector          VARCHAR(100)             │
│ exchange        ENUM                     │
│ current_price   DECIMAL(15,2)            │
│ previous_close  DECIMAL(15,2)            │
│ description     TEXT                     │
│ logo_url        VARCHAR(255)             │
│ is_active       BOOLEAN                  │
│ deleted_at      TIMESTAMP                │
│ created_at      TIMESTAMP                │
│ updated_at      TIMESTAMP                │
└────────────┬─────────────────────────────┘
             │
             │ 1
             │
             │ N
             ▼
┌─────────────────────────────┐
│      PRICE_HISTORIES        │
├─────────────────────────────┤
│ id              PK          │
│ stock_id        FK          │
│ price           DECIMAL     │
│ date            DATE        │
│ created_at      TIMESTAMP   │
│ updated_at      TIMESTAMP   │
└─────────────────────────────┘
```

## Tables

### users

Stores all user accounts (regular users and administrators).

| Column            | Type            | Constraints              | Description                     |
| ----------------- | --------------- | ------------------------ | ------------------------------- |
| id                | BIGINT UNSIGNED | PK, AUTO_INCREMENT       | Primary key                     |
| name              | VARCHAR(255)    | NOT NULL                 | Full name                       |
| email             | VARCHAR(255)    | NOT NULL, UNIQUE         | Login identifier                |
| email_verified_at | TIMESTAMP       | NULL                     | Email verification time         |
| password          | VARCHAR(255)    | NOT NULL                 | Bcrypt hashed                   |
| role              | ENUM            | NOT NULL, DEFAULT 'user' | Either 'user' or 'admin'        |
| balance           | DECIMAL(15,2)   | NOT NULL, DEFAULT 0.00   | Virtual currency balance in VND |
| is_active         | BOOLEAN         | NOT NULL, DEFAULT TRUE   | Account active status           |
| remember_token    | VARCHAR(100)    | NULL                     | "Remember me" cookie token      |
| created_at        | TIMESTAMP       | NULL                     | Record creation time            |
| updated_at        | TIMESTAMP       | NULL                     | Last update time                |

**Indexes**:

- PRIMARY (id)
- UNIQUE (email)

**Business Rules**:

- Email is unique system-wide
- Default role is 'user'
- Inactive accounts cannot log in
- Balance cannot go negative (enforced at application level)

### stocks

Catalog of available securities.

| Column         | Type            | Constraints              | Description               |
| -------------- | --------------- | ------------------------ | ------------------------- |
| id             | BIGINT UNSIGNED | PK, AUTO_INCREMENT       | Primary key               |
| symbol         | VARCHAR(10)     | NOT NULL, UNIQUE         | Ticker symbol (e.g., VNM) |
| company_name   | VARCHAR(255)    | NOT NULL                 | Full company name         |
| sector         | VARCHAR(100)    | NULL                     | Industry sector           |
| exchange       | ENUM            | NOT NULL, DEFAULT 'HOSE' | One of: HOSE, HNX, UPCOM  |
| current_price  | DECIMAL(15,2)   | NOT NULL, DEFAULT 0.00   | Current trading price     |
| previous_close | DECIMAL(15,2)   | NOT NULL, DEFAULT 0.00   | Previous session close    |
| description    | TEXT            | NULL                     | Company description       |
| logo_url       | VARCHAR(255)    | NULL                     | URL to company logo       |
| is_active      | BOOLEAN         | NOT NULL, DEFAULT TRUE   | Available for trading     |
| deleted_at     | TIMESTAMP       | NULL                     | Soft delete timestamp     |
| created_at     | TIMESTAMP       | NULL                     | Record creation time      |
| updated_at     | TIMESTAMP       | NULL                     | Last update time          |

**Indexes**:

- PRIMARY (id)
- UNIQUE (symbol)
- INDEX (is_active)

**Business Rules**:

- Symbol must be unique and uppercase (e.g., VNM, FPT)
- Soft delete preserves transaction history references
- Inactive stocks cannot be traded but remain visible

### transactions

Ledger of all historical stock transactions (read-only after creation).

| Column      | Type            | Constraints                 | Description                           |
| ----------- | --------------- | --------------------------- | ------------------------------------- |
| id          | BIGINT UNSIGNED | PK, AUTO_INCREMENT          | Primary key                           |
| user_id     | BIGINT UNSIGNED | FK, NOT NULL                | References users.id                   |
| stock_id    | BIGINT UNSIGNED | FK, NOT NULL                | References stocks.id                  |
| type        | ENUM            | NOT NULL                    | Either 'buy' or 'sell'                |
| quantity    | INTEGER         | NOT NULL                    | Number of shares                      |
| price       | DECIMAL(15,2)   | NOT NULL                    | Per-share price at execution          |
| total       | DECIMAL(15,2)   | NOT NULL                    | quantity × price                      |
| fee         | DECIMAL(15,2)   | NOT NULL, DEFAULT 0.00      | Transaction fee                       |
| status      | ENUM            | NOT NULL, DEFAULT 'pending' | One of: pending, completed, cancelled |
| executed_at | TIMESTAMP       | NULL                        | Execution timestamp                   |
| created_at  | TIMESTAMP       | NULL                        | Order placement time                  |
| updated_at  | TIMESTAMP       | NULL                        | Last update time                      |

**Indexes**:

- PRIMARY (id)
- INDEX (user_id, created_at) — composite for "user transactions over time"
- INDEX (stock_id, status) — composite for "stock activity by status"

**Foreign Keys**:

- user_id → users.id (ON DELETE CASCADE)
- stock_id → stocks.id (ON DELETE RESTRICT — prevent deleting stocks with history)

**Business Rules**:

- Records are append-only (content immutable after creation)
- Quantity must be positive
- Total = quantity × price
- Fee is 0.15% of total

### portfolios

Current holdings per user (populated via seeder for demo).

| Column     | Type            | Constraints        | Description           |
| ---------- | --------------- | ------------------ | --------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key           |
| user_id    | BIGINT UNSIGNED | FK, NOT NULL       | References users.id   |
| stock_id   | BIGINT UNSIGNED | FK, NOT NULL       | References stocks.id  |
| quantity   | INTEGER         | NOT NULL           | Shares owned          |
| avg_price  | DECIMAL(15,2)   | NOT NULL           | Weighted average cost |
| created_at | TIMESTAMP       | NULL               | Position opened time  |
| updated_at | TIMESTAMP       | NULL               | Last update time      |

**Indexes**:

- PRIMARY (id)
- UNIQUE (user_id, stock_id) — one position per user/stock pair

**Foreign Keys**:

- user_id → users.id (ON DELETE CASCADE)
- stock_id → stocks.id (ON DELETE RESTRICT)

**Business Rules**:

- One row per user/stock combination
- avg_price is the weighted average cost

### watchlists

User's personal stock watchlist.

| Column     | Type            | Constraints        | Description             |
| ---------- | --------------- | ------------------ | ----------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key             |
| user_id    | BIGINT UNSIGNED | FK, NOT NULL       | References users.id     |
| stock_id   | BIGINT UNSIGNED | FK, NOT NULL       | References stocks.id    |
| created_at | TIMESTAMP       | NULL               | When added to watchlist |
| updated_at | TIMESTAMP       | NULL               | Last update time        |

**Indexes**:

- PRIMARY (id)
- UNIQUE (user_id, stock_id) — one entry per user/stock pair

**Foreign Keys**:

- user_id → users.id (ON DELETE CASCADE)
- stock_id → stocks.id (ON DELETE CASCADE)

**Business Rules**:

- One row per user/stock combination
- Adding duplicate is idempotent (use `firstOrCreate`)

### price_histories

Daily historical price snapshots for charting.

| Column     | Type            | Constraints        | Description             |
| ---------- | --------------- | ------------------ | ----------------------- |
| id         | BIGINT UNSIGNED | PK, AUTO_INCREMENT | Primary key             |
| stock_id   | BIGINT UNSIGNED | FK, NOT NULL       | References stocks.id    |
| price      | DECIMAL(15,2)   | NOT NULL           | Price on the given date |
| date       | DATE            | NOT NULL           | Trading date            |
| created_at | TIMESTAMP       | NULL               | Record creation time    |
| updated_at | TIMESTAMP       | NULL               | Last update time        |

**Indexes**:

- PRIMARY (id)
- UNIQUE (stock_id, date) — one entry per stock per day

**Foreign Keys**:

- stock_id → stocks.id (ON DELETE CASCADE)

**Business Rules**:

- One row per stock per date
- Historical data populated by seeder (30 days per stock initially)

## Relationships Summary

| From   | To              | Cardinality | Description                        |
| ------ | --------------- | ----------- | ---------------------------------- |
| users  | transactions    | 1:N         | A user has many transactions       |
| users  | portfolios      | 1:N         | A user holds many positions        |
| users  | watchlists      | 1:N         | A user tracks many stocks          |
| stocks | transactions    | 1:N         | A stock has many transactions      |
| stocks | portfolios      | 1:N         | A stock appears in many portfolios |
| stocks | watchlists      | 1:N         | A stock is watched by many users   |
| stocks | price_histories | 1:N         | A stock has many daily prices      |

## Data Integrity Rules

### Application-Level Constraints

These are enforced in the application code (Form Requests) since they cannot be enforced purely by the database:

1. **Active user**: Inactive users (`is_active = false`) cannot log in.
2. **Watchlist uniqueness**: Adding a duplicate watchlist entry is idempotent (use `firstOrCreate`).
3. **Watchlist ownership**: Only the owner can delete their watchlist entry.

### Database-Level Constraints

- Primary keys ensure unique identifiers
- Foreign keys ensure referential integrity
- UNIQUE constraints prevent duplicates (email, symbol, user/stock in portfolios)
- NOT NULL constraints prevent missing required data
- DEFAULT values provide sensible initial state

## Migration Order

Due to foreign key dependencies, migrations must run in this order:

1. `create_users_table` (Laravel default)
2. `create_stocks_table`
3. `create_transactions_table` (depends on users, stocks)
4. `create_portfolios_table` (depends on users, stocks)
5. `create_price_histories_table` (depends on stocks)
6. `create_watchlists_table` (depends on users, stocks)

Plus auxiliary tables from Laravel defaults:

- `create_password_reset_tokens_table`
- `create_sessions_table`

## Seed Data

The `DatabaseSeeder` populates initial data:

| Seeder             | Records                     | Purpose                  |
| ------------------ | --------------------------- | ------------------------ |
| UserSeeder         | 1 admin + 5 users           | Demo accounts            |
| StockSeeder        | 20 Vietnamese stocks        | Realistic catalog        |
| PriceHistorySeeder | ~600 entries (20 × 30 days) | Chart data               |
| PortfolioSeeder    | Holdings for user1, user3   | Demo portfolio display   |
| TransactionSeeder  | ~7 historical transactions  | Demo transaction history |

## Performance Considerations

### Indexes

All foreign keys are indexed (Laravel default for `constrained()`). Composite indexes added for common query patterns:

- `transactions(user_id, created_at)` for user history listing
- `transactions(stock_id, status)` for stock activity queries

### Query Patterns to Avoid

**N+1 queries**: When listing stocks, do not lazy-load related data. Use eager loading:

```php
// BAD: Triggers N queries (one per stock)
$stocks = Stock::all();
foreach ($stocks as $stock) {
    echo $stock->priceHistories->count();
}

// GOOD: Single query with eager load
$stocks = Stock::with('priceHistories')->get();
```

### Pagination

All listing endpoints use pagination (20 items per page default) to prevent loading entire tables.

## Future Considerations

- **Partitioning**: `price_histories` may grow large; consider partitioning by date in the future
- **Read replicas**: For scaling read traffic
- **Caching**: Redis cache for stock listings, hot data
- **Materialized views**: For computed aggregates (portfolio totals, market summary)

## SQL Export

The database can be exported as a `.sql` file for academic submission:

```
phpMyAdmin → Select database "stock_website" → Export → SQL → Go
```

The exported file contains:

- All `CREATE TABLE` statements
- All `INSERT INTO` statements for seeded data
- Indexes and foreign key constraints
- Compatible with MySQL 8 import
