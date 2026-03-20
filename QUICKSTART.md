# Quick Start Guide - Account Creation Feature

## Getting Started in 3 Steps

### 1. Open the Application

```bash
# Start the development server
npm run dev
```

The application will open in your browser at `http://localhost:3000`

### 2. Create Your First Account

1. Fill out the account creation form with:
   - **Account Type**: Select from Checking, Savings, Business, or Money Market
   - **Full Name**: Enter customer's name
   - **Email**: Enter a valid email address
   - **Phone**: Enter phone number (auto-formats)
   - **SSN**: Enter last 4 digits
   - **Address**: Enter complete address
   - **Initial Deposit**: Enter amount (must meet minimum for account type)

2. Click **"Create Account"**

3. See success message with account details!

### 3. View Your Accounts

- Scroll down to see the **Account Management** section
- View all created accounts in the table
- Click the eye icon (👁️) to view detailed account information
- Switch to **Audit Trail** tab to see all activity logs

## Account Type Minimums

| Account Type | Minimum Deposit |
| ------------ | --------------- |
| Checking     | $25             |
| Savings      | $100            |
| Business     | $500            |
| Money Market | $2,500          |

## Testing the Feature

### Run Automated Tests (Console)

1. Open browser developer console (F12)
2. Type: `runAccountTests()`
3. Press Enter
4. View test results

### Manual Testing

Try these scenarios:

✅ **Happy Path**

```
Type: Checking
Name: John Doe
Email: john.doe@example.com
Phone: 5551234567
SSN: 1234
Address: 123 Main St, City, State 12345
Deposit: $100
```

❌ **Validation Error** (Too Low Deposit)

```
Type: Savings
Deposit: $50
(Should fail - minimum is $100)
```

❌ **Duplicate Account** (After creating first)

```
Use same email and account type
(Should fail - duplicate not allowed)
```

## Key Features to Explore

1. **Real-time Validation**
   - Type in fields and tab out to see validation
   - Errors show immediately
   - Phone number formats as you type

2. **Account Details Modal**
   - Click eye icon on any account
   - See full account information
   - View account-specific activity log

3. **Audit Trail**
   - Click "Audit Trail" tab
   - See all system actions
   - Timestamps in relative format (e.g., "2 minutes ago")

4. **Statistics Dashboard**
   - Total Accounts count
   - Total Balance across all accounts
   - Total Audit Entries

## Browser Storage

All data is stored in browser localStorage:

- **Accounts**: `localStorage.getItem('accounts')`
- **Audit Logs**: `localStorage.getItem('auditLogs')`

To clear all data:

```javascript
localStorage.clear();
location.reload();
```

## Need Help?

- Check `docs/ACCOUNT_CREATION_FEATURE.md` for detailed documentation
- View console for debug messages
- All validation errors show inline on the form

## Next Steps

After creating accounts, you can:

- Create multiple accounts for testing
- View the comprehensive audit trail
- Check account details in the modal
- Export audit logs (future feature)

Enjoy managing bank accounts! 🏦
