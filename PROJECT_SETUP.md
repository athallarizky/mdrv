# MD Review App - Project Setup

## Project Structure

```
mdrv-apps/
├── .kiro/
│   └── specs/
│       └── md-review-app/
│           ├── design.md
│           ├── requirements.md
│           └── tasks.md
├── src/
│   ├── components/     # React components
│   ├── services/       # Business logic services
│   ├── hooks/          # Custom React hooks
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Utility functions
│   └── test/           # Test setup files
├── dist/               # Build output
└── public/             # Static assets

## Technology Stack

- **React 19.2.0** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 4.1.17** - Utility-first CSS framework
- **Vitest 4.0.14** - Testing framework
- **fast-check 4.3.0** - Property-based testing library

## Key Dependencies

### UI & Styling
- `class-variance-authority` - Component variant management
- `clsx` & `tailwind-merge` - Conditional class names
- `lucide-react` - Icon library
- `@tailwindcss/postcss` - Tailwind CSS PostCSS plugin

### Markdown Processing
- `react-markdown` - Markdown rendering
- `react-syntax-highlighter` - Code syntax highlighting

### Testing
- `vitest` - Test runner
- `@vitest/ui` - Test UI
- `fast-check` - Property-based testing
- `jsdom` - DOM environment for tests
- `@testing-library/react` - React testing utilities
- `@testing-library/jest-dom` - DOM matchers

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests once
- `npm run test:watch` - Run tests in watch mode
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Lint code

## Configuration Files

- `vite.config.ts` - Vite configuration with path aliases
- `vitest.config.ts` - Vitest test configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

## Path Aliases

The project uses path aliases for cleaner imports:
- `@/*` maps to `./src/*`

Example: `import { cn } from '@/utils'`

## Next Steps

Follow the implementation tasks in `.kiro/specs/md-review-app/tasks.md` to build the application.
