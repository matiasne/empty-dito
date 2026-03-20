# dito empty local test

A minimal, production-ready boilerplate project built with HTML, CSS, and vanilla JavaScript.

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
│   │   ├── main.css
│   │   ├── variables.css
│   │   └── reset.css
│   ├── js/
│   │   ├── index.js
│   │   └── utils.js
│   └── assets/
│       └── images/
├── index.html
├── package.json
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
