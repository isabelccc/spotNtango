# SpotnTango Product Catalog

A responsive shopping catalog built with React + TypeScript.  
This project was completed as a take-home assignment and focuses on product browsing and cart interactions with clean UI state management.

## Demo

- Loom demo: [React and TypeScript Shopping App Demo](https://www.loom.com/share/2c37edb428b14fe993aa62a6b0b14ae6)

## Features

- Fetch products from remote JSON API
- Category filter (`All`, `Laptop`, `Tablet`, `Mobile`, `Accessory`)
- Price sorting (`High to Low`, `Low to High`)
- View toggle (`Grid` / `List`)
- Pagination (with `Prev`, page numbers, `Next`)
- Product category icons and discount badges
- Cart drawer (open from top-right cart icon)
- Add/remove quantity controls in both cards and cart drawer
- Live total price calculation
- Local storage persistence for:
  - selected category
  - cart contents
- Fallback handling for stale/invalid local cart data
- Unavailable products are disabled and marked `Sold Out`

## Tech Stack

- React 19
- TypeScript
- Vite
- ESLint
- CSS (custom, no UI framework)

## Getting Started

### Prerequisites

- Node.js 18+ (recommended)
- npm

### Install

```bash
npm install
```

### Run development server

```bash
npm run dev
```

The app will run on the local Vite URL shown in terminal (usually `http://localhost:5173`).

### Build for production

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```text
src/
  api/
    product.ts        # product fetch + API shape mapping
  types/
    product.ts        # Product and Category types
  App.tsx             # main UI and state logic
  App.css             # component/page styling
  main.tsx            # app entry
```

## Design Notes

- Cart state is normalized as `Record<productId, quantity>`
- Invalid cart data is sanitized on load and ignored in rendering/total calculations
- Pagination is derived from current filter/sort/view state
- UI is mobile-friendly with responsive CSS rules

## Known Limitations

- No backend cart sync (client-side only)
- No authentication/checkout flow
- Product images are icon/placeholder based

## Author

- Isabel chen
