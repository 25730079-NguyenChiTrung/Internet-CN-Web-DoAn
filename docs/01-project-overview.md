# Project Overview

## About

Stock Trading Website is a web-based simulated stock trading platform developed as the final project for the Internet & Web Technology course at the University of Information Technology (UIT).

The system enables users to learn about stock trading through paper-trading mechanics, with all transactions performed using virtual currency. No real money or real exchange connectivity is involved.

## Vision

Provide a realistic yet safe environment for understanding equity trading workflows: browsing securities, analyzing price movements, executing orders, and managing portfolios.

## Scope

### In Scope

- User registration, authentication, and role-based access (User, Admin)
- Stock catalog with detailed pages and historical price charts
- Portfolio management with profit/loss tracking
- Watchlist to track stocks of interest
- Transaction history with filtering
- Administrative interfaces for stock and user management
- Responsive design (mobile, tablet, desktop)
- Database design and SQL export capability

### Out of Scope

- Real-time price feed from live exchanges
- Real money transactions
- Multi-currency support
- Options, futures, or derivatives trading
- Social/community features
- Native mobile applications
- Algorithmic/bot trading

## Stakeholders

| Role                | Responsibility                                               |
| ------------------- | ------------------------------------------------------------ |
| End User (Investor) | Uses the platform to learn trading, manage virtual portfolio |
| Administrator       | Manages stock listings, user accounts, monitors system       |
| Development Team    | Builds, maintains, and deploys the application               |
| Faculty Reviewer    | Evaluates the academic deliverable                           |

## Functional Requirements

### User-facing Capabilities

1. **Account Management**
    - Register with email and password
    - Login with credentials, with session persistence
    - Reset forgotten password via email
    - Update profile information
    - View current account balance

2. **Stock Discovery**
    - Browse complete catalog of listed stocks
    - Search by symbol or company name
    - Filter by industry sector or exchange
    - Sort by price, percentage change, or volume

3. **Stock Analysis**
    - View detailed company information
    - View 30-day historical price chart
    - View current price metrics

4. **Watchlist**
    - Add stocks to a personal watchlist
    - Remove stocks from watchlist
    - Quick access to tracked securities

5. **Portfolio Management**
    - View current holdings with quantity, average price, market value
    - View aggregate profit/loss
    - View allocation breakdown

6. **Transaction History**
    - View all past transactions
    - Filter by date range, transaction type

### Administrative Capabilities

1. **Stock Management**
    - Create new stock listings with metadata
    - Update stock information and prices
    - Soft-delete inactive stocks
    - Bulk operations (optional)

2. **User Management**
    - View all registered users
    - View individual user profile and activity
    - Lock or unlock user accounts
    - Adjust user balances (credit virtual funds)

3. **Reporting**
    - View aggregate statistics (total users, total transactions, total volume)
    - View recent activity

## Non-Functional Requirements

### Performance

- Page loads under 2 seconds on standard connection
- Time to interactive under 3 seconds
- Database queries optimized to avoid N+1 patterns

### Security

- All user input validated server-side
- SQL injection prevention via ORM
- Cross-site scripting (XSS) prevention via framework escaping
- Cross-site request forgery (CSRF) protection on state-changing operations
- Password hashing with bcrypt (cost factor 12)
- Rate limiting on authentication endpoints
- Session-based authentication with secure cookies

### Reliability

- Database transactions ensure atomicity for multi-step operations
- Error logging for diagnostics
- Graceful error messages to end users

### Usability

- Mobile-first responsive design
- Accessible UI (WCAG 2.1 AA target)
- Vietnamese language for end users
- Clear feedback for all user actions

### Maintainability

- MVC architecture with clear separation of concerns
- Service layer for complex business logic
- Type safety with TypeScript on frontend
- Linted and formatted code
- Comprehensive documentation

## Success Criteria

The project succeeds when:

1. All listed functional requirements are demonstrable
2. Non-functional requirements meet defined thresholds
3. Database schema is normalized and documented
4. Code passes linting.
5. Deployment is reproducible from documentation
6. The system can be operated by a new user without prior training

## Glossary

| Term              | Definition                                                              |
| ----------------- | ----------------------------------------------------------------------- |
| **Paper Trading** | Simulated trading with virtual currency for educational purposes        |
| **Symbol**        | A short code identifying a publicly-traded security (e.g., VNM, FPT)    |
| **Portfolio**     | Collection of securities held by a user                                 |
| **Position**      | A specific holding of one security in a portfolio                       |
| **Lot**           | Standard trading unit; in Vietnamese markets, 100 shares per lot        |
| **Average Cost**  | Weighted average price paid for a position                              |
| **P&L**           | Profit and Loss; difference between current market value and cost basis |
| **HOSE**          | Ho Chi Minh City Stock Exchange                                         |
| **HNX**           | Hanoi Stock Exchange                                                    |
| **UPCOM**         | Unlisted Public Company Market                                          |
