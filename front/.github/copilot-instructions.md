
You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

## TypeScript Best Practices

- Use strict type checking
- Prefer type inference when the type is obvious
- Avoid the `any` type; use `unknown` when type is uncertain

## Angular Best Practices

- Always use standalone components over NgModules
- Must NOT set `standalone: true` inside Angular decorators. It's the default in Angular v20+.
- Use signals for state management
- Implement lazy loading for feature routes
- Do NOT use the `@HostBinding` and `@HostListener` decorators. Put host bindings inside the `host` object of the `@Component` or `@Directive` decorator instead
- Use `NgOptimizedImage` for all static images.
  - `NgOptimizedImage` does not work for inline base64 images.

## Accessibility Requirements

- It MUST pass all AXE checks.
- It MUST follow all WCAG AA minimums, including focus management, color contrast, and ARIA attributes.

### Components

- Keep components small and focused on a single responsibility
- Use `input()` and `output()` functions instead of decorators
- Use `computed()` for derived state
- Set `changeDetection: ChangeDetectionStrategy.OnPush` in `@Component` decorator
- Prefer inline templates for small components
- Prefer Reactive forms instead of Template-driven ones
- Do NOT use `ngClass`, use `class` bindings instead
- Do NOT use `ngStyle`, use `style` bindings instead
- When using external templates/styles, use paths relative to the component TS file.

### Forms

- **Reactive forms**: Bind controls directly in templates without helper methods:
  - Access form controls via `form.controls.fieldName` in templates
  - Check errors directly with `form.controls.fieldName?.errors?.['errorType']`
  - Check touched state with `form.controls.fieldName.touched`
  - Example:
    ```typescript
    // Component TypeScript - no helper methods needed
    readonly form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
    ```
    ```html
    <!-- Template HTML - direct error checking -->
    <input [formControl]="form.controls.email" />
    @if (form.controls.email?.errors?.['required'] && form.controls.email.touched) {
      <p-message severity="error" variant="simple" size="small">
        Ce champ est requis
      </p-message>
    }
    @if (form.controls.email?.errors?.['invalidEmail'] && form.controls.email.touched) {
      <p-message severity="error" variant="simple" size="small">
        Email invalide
      </p-message>
    }
    ```
  - **Advantages**: Clean codebase without boilerplate, direct access to errors in templates, better IDE autocomplete, minimal methods
- **Submit buttons**: Do NOT disable submit buttons when the form is invalid. Instead:
  - Keep the button enabled so users can attempt submission
  - Display validation errors when fields are touched
  - Prevent actual API calls with `if (!this.form.valid) { this.form.markAllAsTouched(); return; }` in the handler
  - This improves UX by letting users understand what fields are missing/invalid without guessing
- Validate individually per field as users type for better feedback
- Show field-level error messages inline with affected fields using PrimeNG `<p-message>` component with `severity="error"`, `variant="simple"`, and `size="small"`
- For form-level validators (e.g., `passwordMismatch`), check via `form.errors?.['validatorName']` in the template

## State Management

- Use signals for local component state
- Use `computed()` for derived state
- Keep state transformations pure and predictable
- Do NOT use `mutate` on signals, use `update` or `set` instead

## Templates

- Keep templates simple and avoid complex logic
- Use native control flow (`@if`, `@for`, `@switch`) instead of `*ngIf`, `*ngFor`, `*ngSwitch`
- Use the async pipe to handle observables
- Do not assume globals like (`new Date()`) are available.

## Services

- Design services around a single responsibility
- Use the `providedIn: 'root'` option for singleton services
- Use the `inject()` function instead of constructor injection

## PrimeNG Component Guidelines

- Import only required modules (e.g., `ButtonModule`, `CardModule`) rather than wildcard imports
- Use PrimeNG components with Tailwind utilities for consistent styling
- All PrimeNG components must maintain WCAG AA compliance; verify focus management and keyboard navigation
- **Customize PrimeNG theme**: Override default colors with brand CSS variables (`--color-primary`, `--color-danger`, etc.)
- Use theme variables throughout components instead of hardcoded colors
- Document any custom styling overrides that deviate from theme defaults
- Apply PrimeNG severity levels consistently: `success`, `info`, `warning`, `danger` mapped to brand semantic colors

## Design System & Brand Guidelines

### Color Palette

Define these CSS variables in the root stylesheet for consistent theming:

```css
:root {
  /* Primary & Accent Colors */
  --color-primary: #ceaa18;        /* Gold accent - use for primary actions, highlights */
  --color-primary-dark: #a88914;   /* Darker gold for hover states */
  --color-primary-light: #e0bb2a;  /* Lighter gold for backgrounds */
  
  /* Neutral Colors */
  --color-text-primary: #222222;   /* Dark gray - main text */
  --color-text-secondary: #666666; /* Medium gray - secondary text, borders */
  --color-background: #ffffff;
  --color-background-light: #eeeeee; /* Light gray - subtle backgrounds */
  
  /* Semantic Colors */
  --color-danger: #dc3232;         /* Red - errors, warnings */
  --color-success: #4caf50;
  --color-info: #2196f3;
  --color-warning: #ff9800;
}
```

### Typography

- **Font Family**: Open Sans (fallback: sans-serif)
- Apply Open Sans globally in root styles and all components
- Use standard font weights: 400 (regular), 600 (semibold), 700 (bold)
- Headings: h1–h6 should use 700 weight with appropriate sizing
- Body text: Use 400 weight at 14–16px

### Color Usage Guidelines

- **Primary Actions**: Use `--color-primary` (#ceaa18) for buttons, links, active states
- **Text**: Use `--color-text-primary` (#222222) for main text; `--color-text-secondary` (#666666) for secondary/disabled text
- **Error States**: Use `--color-danger` (#dc3232) for validation errors, alerts
- **Backgrounds**: Use `--color-background-light` (#eee) for subtle section backgrounds, hover states
- **Never hardcode colors**: Always reference CSS variables via `var(--color-*)` in styles
- Verify all color combinations meet WCAG AA contrast ratios (4.5:1 for text, 3:1 for graphics)

### PrimeNG Theme Customization

Override PrimeNG Nora theme defaults to match brand colors:

```typescript
// Configure PrimeNG preset colors in app.config.ts or component styles
import { providePrimeng } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    providePrimeng({
      theme: {
        preset: 'nora',
        options: {
          primary: '#ceaa18',        // Brand gold
          surface: '#ffffff',
          darkSurface: '#222222',    // Brand dark
          gray: '#666666',           // Brand gray
          danger: '#dc3232',         // Brand danger
          focusRing: '0 0 0 0.2rem rgba(206, 170, 24, 0.5)', // Gold focus ring
        }
      }
    })
  ]
};
```

## Styling & Tailwind Integration

- Use Tailwind utilities as the primary styling mechanism
- Apply `tailwindcss-primeui` utilities when styling PrimeNG components
- Define custom CSS only when Tailwind cannot express the design (e.g., CSS Grid layouts, complex animations)
- Place component-scoped styles in the component's `.css` file; use CSS variables for theming
- **Always use CSS variables** (`var(--color-primary)`) instead of hardcoded colors to maintain design consistency
- Extend Tailwind config with CSS variables for colors (avoid hardcoded hex values in utility classes)

## Development Workflow

**Starting the dev server:**
```bash
npm start
```
Runs Angular dev server on `http://localhost:4200/` with HMR enabled.

**Running tests:**
```bash
npm test
```
Executes Vitest suite in watch mode. Test files are colocated with components (`.spec.ts`).

**Building for production:**
```bash
npm build
```
Generates optimized build artifacts in `dist/` with tree-shaking and minification.

**Incremental development builds:**
```bash
npm run watch
```
Compiles changes without serving; useful for external dev servers.

## Project Structure & Conventions

- **Components**: `src/app/components/` – Reusable UI components
- **Features**: `src/app/features/` – Feature modules with lazy-loaded routes
- **Services**: `src/app/services/` – Singleton services with `providedIn: 'root'`
- **Types**: `src/app/types/` – Shared interfaces and type definitions
- **Utilities**: `src/app/utils/` – Pure utility functions
- All new components are generated with `app` prefix (set in `angular.json`)

## Code Generation

Use Angular CLI schematics for consistency:

```bash
# Generate a standalone component
ng generate component features/my-feature/my-component

# Generate a service
ng generate service services/my-service

# Generate a route
ng generate module features/my-feature --route my-feature --module app.routes
```

Generated code follows the established patterns above automatically.

## Testing Guidelines

- Write unit tests for services, pipes, and utility functions
- Use Vitest's `describe` and `it` blocks
- Mock PrimeNG components when testing parent components
- Test accessibility: verify keyboard navigation and screen reader compatibility
- Aim for >80% code coverage on critical paths

## Debugging & Common Issues

- Use Chrome DevTools to inspect Angular component tree and signals state
- If styles don't apply: check CSS specificity conflicts with Tailwind or PrimeNG
- For PrimeNG component issues: verify the correct module is imported
- Check browser console for accessibility warnings (AXE integration)
