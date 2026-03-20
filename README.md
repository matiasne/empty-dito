# Bank Account Management System

A comprehensive bank account creation and management system built with HTML, CSS, and vanilla JavaScript.

## 🎯 Current Features

### ✅ Account Creation Feature (IMPLEMENTED)

Complete account management system with:

- **Account Creation**: Create new bank accounts with comprehensive validation
- **Multiple Account Types**: Checking, Savings, Business, Money Market
- **Data Validation**: Real-time field validation and business rules enforcement
- **Audit Trail**: Complete activity logging for compliance
- **Account Management**: View, search, and manage all accounts
- **Persistent Storage**: LocalStorage-based database simulation

See [QUICKSTART.md](QUICKSTART.md) for a quick guide or [docs/ACCOUNT_CREATION_FEATURE.md](docs/ACCOUNT_CREATION_FEATURE.md) for detailed documentation.

### ✅ Customer Management Feature (IMPLEMENTED)

Comprehensive customer management system with:

- **Customer CRUD Operations**: Create, update, delete, and query customers
- **Credit Score Integration**: Automatic credit score retrieval from credit agency
- **Data Validation**: Comprehensive validation including age verification (18+)
- **Search & Filtering**: Multi-criteria search by name, email, phone, or ID
- **Status Management**: Manage customer status (active, inactive, suspended, blocked)
- **Audit Trail**: Complete logging of all customer operations
- **Security Features**: SSN masking, sensitive data protection
- **Business Rules**: Duplicate prevention, age verification, account safety checks

See [docs/CUSTOMER_MANAGEMENT_FEATURE.md](docs/CUSTOMER_MANAGEMENT_FEATURE.md) for complete documentation or [CUSTOMER_MANAGEMENT_SUMMARY.md](CUSTOMER_MANAGEMENT_SUMMARY.md) for quick reference.

## Features

- Clean and organized project structure
- Modern JavaScript (ES6+)
- Responsive CSS with CSS variables
- ESLint for JavaScript linting
- Stylelint for CSS linting
- Prettier for code formatting
- Development server setup

## Project Structure

```
.
├── src/
│   ├── css/
│   │   ├── main.css           # Main application styles
│   │   ├── variables.css      # CSS custom properties
│   │   ├── reset.css          # CSS reset
│   │   └── account.css        # Account management styles
│   ├── js/
│   │   ├── index.js           # Application entry point
│   │   ├── utils.js           # General utilities
│   │   ├── components/
│   │   │   ├── accountForm.js    # Account creation form
│   │   │   └── accountList.js    # Account list & audit viewer
│   │   ├── services/
│   │   │   ├── accountService.js        # Account business logic
│   │   │   ├── customerService.js       # Customer business logic
│   │   │   ├── creditAgencyInterface.js # Credit score integration
│   │   │   └── auditService.js          # Audit trail service
│   │   ├── database/
│   │   │   ├── accountDatabase.js   # Account data persistence
│   │   │   └── customerDatabase.js  # Customer data persistence
│   │   ├── validators/
│   │   │   ├── accountValidator.js  # Account validation
│   │   │   └── customerValidator.js # Customer validation
│   │   ├── utils/
│   │   │   ├── accountUtils.js      # Account utilities
│   │   │   └── customerUtils.js     # Customer utilities
│   │   └── tests/
│   │       ├── accountServiceTest.js  # Account test suite
│   │       └── customerServiceTest.js # Customer test suite
│   └── assets/
│       └── images/
├── docs/
│   ├── ACCOUNT_CREATION_FEATURE.md  # Account feature docs
│   └── CUSTOMER_MANAGEMENT_FEATURE.md # Customer feature docs
├── index.html
├── package.json
├── QUICKSTART.md                     # Quick start guide
├── CUSTOMER_MANAGEMENT_SUMMARY.md   # Customer feature summary
├── .eslintrc.json
├── .stylelintrc.json
├── .prettierrc
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

The application will open in your browser at `http://localhost:3000`.

Alternatively, you can use a simple static server:

```bash
npm start
```

### Linting

Run JavaScript linting:

```bash
npm run lint:js
```

Run CSS linting:

```bash
npm run lint:css
```

### Formatting

Format all files:

```bash
npm run format
```

Check if files are formatted correctly:

```bash
npm run format:check
```

## Building for Production

Simply deploy the root directory contents to your web server or hosting platform. All files are already optimized for production use.

For static hosting platforms (Netlify, Vercel, GitHub Pages, etc.), point to the root directory as your build output.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
