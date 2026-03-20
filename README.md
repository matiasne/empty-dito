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
│   │   │   ├── accountService.js # Account business logic
│   │   │   └── auditService.js   # Audit trail service
│   │   ├── database/
│   │   │   └── accountDatabase.js # Data persistence layer
│   │   ├── validators/
│   │   │   └── accountValidator.js # Input validation
│   │   ├── utils/
│   │   │   └── accountUtils.js    # Account utilities
│   │   └── tests/
│   │       └── accountServiceTest.js # Test suite
│   └── assets/
│       └── images/
├── docs/
│   └── ACCOUNT_CREATION_FEATURE.md  # Feature documentation
├── index.html
├── package.json
├── QUICKSTART.md          # Quick start guide
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
